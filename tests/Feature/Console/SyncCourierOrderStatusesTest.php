<?php

use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

function configurePathaoForScheduledSync(): void
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

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
    ]);
}

test('the scheduled sync updates an in-flight automated order from the courier status', function () {
    configurePathaoForScheduledSync();

    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Delivery'],
        ]),
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000, 'access_token' => 'token', 'refresh_token' => 'refresh',
        ]),
    ]);

    $this->artisan('courier:sync-order-statuses')->assertExitCode(0);

    expect($order->fresh()->status)->toBe(OrderStatus::Delivered);
});

test('the scheduled sync skips orders in manual sync mode', function () {
    configurePathaoForScheduledSync();

    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'manual',
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);

    $this->artisan('courier:sync-order-statuses')->assertExitCode(0);

    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'CONSIGN-1'));
    expect($order->fresh()->status)->toBe(OrderStatus::CourierSubmitted);
});

test('the scheduled sync skips orders never submitted to a courier', function () {
    configurePathaoForScheduledSync();

    Order::factory()->create([
        'status' => OrderStatus::Pending,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => null,
    ]);

    $this->artisan('courier:sync-order-statuses')->assertExitCode(0);

    Http::assertNothingSent();
});

test('the scheduled sync skips orders already in a terminal status', function () {
    configurePathaoForScheduledSync();

    foreach ([OrderStatus::Cancelled, OrderStatus::Returned, OrderStatus::Delivered] as $status) {
        Order::factory()->create([
            'status' => $status,
            'status_sync_mode' => 'automated',
            'courier_consignment_id' => 'CONSIGN-'.$status->value,
            'courier_provider' => 'pathao',
        ]);
    }

    $this->artisan('courier:sync-order-statuses')->assertExitCode(0);

    Http::assertNothingSent();
});

test('a courier failure for one order does not stop the rest of the batch from syncing', function () {
    configurePathaoForScheduledSync();

    $failing = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => 'CONSIGN-FAIL',
        'courier_provider' => 'pathao',
    ]);

    $succeeding = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => 'CONSIGN-OK',
        'courier_provider' => 'pathao',
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders/CONSIGN-FAIL/info' => Http::response(['message' => 'Server error'], 500),
        '*/aladdin/api/v1/orders/CONSIGN-OK/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-OK', 'order_status_slug' => 'Delivery'],
        ]),
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000, 'access_token' => 'token', 'refresh_token' => 'refresh',
        ]),
    ]);

    $this->artisan('courier:sync-order-statuses')->assertExitCode(0);

    expect($failing->fresh()->status)->toBe(OrderStatus::CourierSubmitted)
        ->and($succeeding->fresh()->status)->toBe(OrderStatus::Delivered);
});
