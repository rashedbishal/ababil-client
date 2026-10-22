<?php

use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

test('visiting the dashboard refreshes the courier status of automated, in-flight recent orders', function () {
    $this->actingAsAdmin();

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

    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
        'courier_tracking_code' => 'TRACK-123',
    ]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            // "Delivered" (not "Delivery") is the raw text Pathao actually
            // sends for this status - exercises the mapStatus() fix.
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Delivered'],
        ]),
    ]);

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('recentOrders.0.status', 'Delivered'));

    expect($order->fresh()->status)->toBe(OrderStatus::Delivered)
        // Pathao's getParcelStatus() never reports a tracking code itself,
        // so RefreshCourierStatusAction falls back to the order's existing
        // one - which depends on the dashboard's query having selected it.
        ->and($order->fresh()->courier_tracking_code)->toBe('TRACK-123');
});
