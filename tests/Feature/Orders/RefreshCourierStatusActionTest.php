<?php

use App\Actions\Orders\RefreshCourierStatusAction;
use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

function configurePathaoForAction(): void
{
    Setting::set('courier_default_provider', 'pathao');
    CourierProvider::query()->create([
        'name' => 'pathao',
        'credentials' => [
            'base_url' => 'https://courier-api-sandbox.pathao.com',
            'client_id' => 'id',
            'client_secret' => 'secret',
            'username' => 'test@pathao.com',
            'password' => 'lovePathao',
            'store_id' => '123',
        ],
    ]);
}

test('refreshing an order whose courier status has not changed does not touch the database', function () {
    configurePathaoForAction();

    $order = Order::factory()->create([
        'status' => OrderStatus::Shipped,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
        'courier_status' => 'in_transit',
        'courier_raw_status' => 'In_Transit',
        'courier_tracking_code' => 'TRACK-1',
    ]);
    $updatedAtBefore = $order->updated_at;

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'In_Transit'],
        ]),
    ]);

    $updateQueries = [];
    DB::listen(function ($query) use (&$updateQueries) {
        if (str_starts_with(strtolower($query->sql), 'update "orders"') || str_starts_with(strtolower($query->sql), 'update `orders`')) {
            $updateQueries[] = $query->sql;
        }
    });

    app(RefreshCourierStatusAction::class)->execute($order, null);

    expect($updateQueries)->toBe([])
        ->and($order->fresh()->updated_at->equalTo($updatedAtBefore))->toBeTrue();
});

test('refreshing an order whose courier status changed does write the new values', function () {
    configurePathaoForAction();

    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
        'courier_status' => 'pending',
        'courier_raw_status' => 'Pending',
    ]);
    $updatedAtBefore = $order->updated_at;

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'In_Transit'],
        ]),
    ]);

    // Guarantees updated_at actually differs, rather than landing in the
    // same second as creation and making the "it did write" assertion
    // below pass by coincidence regardless of whether a write happened.
    $this->travel(1)->seconds();

    app(RefreshCourierStatusAction::class)->execute($order, null);
    $order->refresh();

    expect($order->courier_status->value)->toBe('in_transit')
        ->and($order->updated_at->greaterThan($updatedAtBefore))->toBeTrue();
});
