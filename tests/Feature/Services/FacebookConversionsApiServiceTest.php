<?php

use App\Enums\FacebookEventLogStatus;
use App\Jobs\SendFacebookPurchaseEvent;
use App\Models\FacebookEventLog;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Services\Facebook\FacebookConversionsApiService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

test('it does nothing when the pixel id or access token is not configured', function () {
    Http::fake();

    $order = Order::factory()->create();
    OrderItem::factory()->for($order)->create();

    (new FacebookConversionsApiService)->sendPurchaseEvent($order);

    Http::assertNothingSent();
    expect(FacebookEventLog::query()->count())->toBe(0);
});

test('it sends a purchase event matching the client-side dataLayer event id', function () {
    Setting::set('facebook_pixel_id', '123456789');
    Setting::setEncrypted('facebook_conversions_api_access_token', 'test-access-token');
    Setting::set('currency', 'BDT');

    Http::fake([
        'graph.facebook.com/*' => Http::response(['events_received' => 1]),
    ]);

    $order = Order::factory()->create([
        'order_number' => 'ORD-260101-ABC123',
        'customer_phone' => '01711111111',
        'customer_ip' => '203.0.113.5',
        'user_agent' => 'Mozilla/5.0 Test',
        'grand_total' => 1069,
    ]);
    OrderItem::factory()->for($order)->create(['sku' => 'SKU-001', 'quantity' => 2, 'unit_price' => 500]);

    (new FacebookConversionsApiService)->sendPurchaseEvent($order, fbp: 'fb.1.111.222', fbc: 'fb.1.111.333');

    Http::assertSent(function ($request) use ($order) {
        $body = $request->data();
        $event = json_decode($body['data'], true)[0];

        return $request->url() === 'https://graph.facebook.com/v21.0/123456789/events'
            && $body['access_token'] === 'test-access-token'
            && $event['event_name'] === 'Purchase'
            // Must match the browser-side dataLayer push's event_id
            // (resources/js/lib/analytics.ts) for Meta to deduplicate.
            && $event['event_id'] === $order->order_number
            && $event['user_data']['ph'][0] === hash('sha256', '8801711111111')
            && $event['user_data']['client_ip_address'] === '203.0.113.5'
            && $event['user_data']['fbp'] === 'fb.1.111.222'
            && $event['user_data']['fbc'] === 'fb.1.111.333'
            && $event['custom_data']['currency'] === 'BDT'
            && (float) $event['custom_data']['value'] === 1069.0;
    });

    $log = FacebookEventLog::first();
    expect($log)->not->toBeNull()
        ->and($log->order_id)->toBe($order->id)
        ->and($log->order_number)->toBe($order->order_number)
        ->and($log->event_id)->toBe($order->order_number)
        ->and($log->status)->toBe(FacebookEventLogStatus::Success)
        ->and($log->http_status)->toBe(200);
});

test('a failed graph api response causes the queued job to retry rather than silently drop the event', function () {
    Setting::set('facebook_pixel_id', '123456789');
    Setting::setEncrypted('facebook_conversions_api_access_token', 'test-access-token');

    Http::fake([
        'graph.facebook.com/*' => Http::response(['error' => ['message' => 'Invalid token']], 400),
    ]);

    $order = Order::factory()->create();
    OrderItem::factory()->for($order)->create();

    $job = new SendFacebookPurchaseEvent($order->id);

    expect(fn () => $job->handle(app(FacebookConversionsApiService::class)))
        ->toThrow(RequestException::class);

    $log = FacebookEventLog::first();
    expect($log)->not->toBeNull()
        ->and($log->event_id)->toBe($order->order_number)
        ->and($log->status)->toBe(FacebookEventLogStatus::Failed)
        ->and($log->http_status)->toBe(400)
        ->and($log->message)->toBe('Invalid token');
});
