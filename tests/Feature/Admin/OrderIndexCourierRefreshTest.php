<?php

use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;

function configurePathaoForRefresh(): void
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

test('visiting the orders index refreshes the courier status of automated, in-flight orders shown on the page', function () {
    $this->actingAsAdmin();
    configurePathaoForRefresh();

    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
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

    $this->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page
            ->where('orders.data.0.display_status_label', 'Delivery'));

    expect($order->fresh()->status)->toBe(OrderStatus::Delivered);
});

test('visiting the orders index does not call the courier for manual or already-terminal orders', function () {
    $this->actingAsAdmin();
    configurePathaoForRefresh();

    Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'manual',
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);

    Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'courier_consignment_id' => 'CONSIGN-2',
        'courier_provider' => 'pathao',
    ]);

    Http::fake();

    $this->get(route('admin.orders.index'));

    // Not assertNothingSent(): Inertia SSR (config/inertia.php) makes its
    // own unrelated HTTP call to render the page, which Http::fake() also
    // intercepts and records - the property under test is that neither
    // order triggered a call to Pathao specifically.
    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'pathao'));
});

test('a courier failure while refreshing the orders index does not break the page', function () {
    $this->actingAsAdmin();
    configurePathaoForRefresh();

    Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response(['message' => 'Server error'], 500),
    ]);

    $this->get(route('admin.orders.index'))->assertOk();
});
