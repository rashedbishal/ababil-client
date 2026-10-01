<?php

use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function actingAsAdmin(): User
{
    $admin = User::factory()->create(['is_admin' => true]);
    test()->actingAs($admin);

    return $admin;
}

beforeEach(function () {
    Setting::set('courier_default_provider', 'pathao');
    CourierProvider::query()->create([
        'name' => 'pathao',
        'credentials' => [
            'base_url' => 'https://courier-api-sandbox.pathao.com',
            'client_id' => 'test-client-id',
            'client_secret' => 'test-client-secret',
            'username' => 'test@pathao.com',
            'password' => 'lovePathao',
            'store_id' => '123',
            'delivery_type' => '48',
            'item_type' => '2',
        ],
    ]);
});

test('an admin can submit a pending order to the courier', function () {
    actingAsAdmin();

    $order = Order::factory()
        ->has(OrderItem::factory()->count(1), 'items')
        ->create(['status' => OrderStatus::Pending]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status' => 'Pending'],
        ]),
    ]);

    $response = $this->post(route('admin.orders.courier.submit', $order));

    $response->assertRedirect();
    $order->refresh();

    expect($order->courier_consignment_id)->toBe('CONSIGN-1')
        ->and($order->courier_provider)->toBe('pathao')
        ->and($order->status)->toBe(OrderStatus::CourierSubmitted);
});

test('an admin cannot submit the same order to the courier twice', function () {
    actingAsAdmin();

    $order = Order::factory()->create(['courier_consignment_id' => 'ALREADY-SUBMITTED']);

    $response = $this->post(route('admin.orders.courier.submit', $order));

    $response->assertRedirect();
    Http::assertNothingSent();
});

test('submitting to the courier fails gracefully when no provider is configured', function () {
    actingAsAdmin();

    Setting::set('courier_default_provider', null);

    $order = Order::factory()->create();

    $response = $this->post(route('admin.orders.courier.submit', $order));

    $response->assertRedirect();
    $response->assertSessionMissing('errors');
    expect($order->fresh()->courier_consignment_id)->toBeNull();
});

test('a cancelled order cannot be submitted to the courier', function () {
    actingAsAdmin();

    $order = Order::factory()
        ->has(OrderItem::factory()->count(1), 'items')
        ->create(['status' => OrderStatus::Cancelled]);

    $response = $this->post(route('admin.orders.courier.submit', $order));

    $response->assertRedirect();
    Http::assertNothingSent();
    expect($order->fresh()->courier_consignment_id)->toBeNull();
});

test('a cancelled order cannot have its courier status refreshed', function () {
    actingAsAdmin();

    $order = Order::factory()->create([
        'status' => OrderStatus::Cancelled,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);

    $response = $this->post(route('admin.orders.courier.refresh', $order));

    $response->assertRedirect();
    Http::assertNothingSent();
});

test('a non-admin cannot submit an order to the courier', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $order = Order::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.orders.courier.submit', $order));

    $response->assertForbidden();
});

test('an admin can refresh a submitted order courier status', function () {
    actingAsAdmin();

    $order = Order::factory()->create(['courier_consignment_id' => 'CONSIGN-1', 'courier_provider' => 'pathao']);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Delivered'],
        ]),
    ]);

    $response = $this->post(route('admin.orders.courier.refresh', $order));

    $response->assertRedirect();

    expect($order->fresh()->courier_raw_status)->toBe('Delivered');
});

test('opening an order already submitted to the courier automatically refreshes its courier status', function () {
    actingAsAdmin();

    $order = Order::factory()->create(['courier_consignment_id' => 'CONSIGN-1', 'courier_provider' => 'pathao']);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Delivered'],
        ]),
    ]);

    $response = $this->get(route('admin.orders.show', $order));

    $response->assertOk();
    expect($order->fresh()->courier_raw_status)->toBe('Delivered');
});

test('opening an order that was never submitted to the courier does not call the courier', function () {
    actingAsAdmin();

    $order = Order::factory()->create(['courier_consignment_id' => null]);

    Http::fake();

    $this->get(route('admin.orders.show', $order))->assertOk();

    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'pathao'));
});

test('opening a cancelled order does not auto-refresh its courier status', function () {
    actingAsAdmin();

    $order = Order::factory()->create([
        'status' => OrderStatus::Cancelled,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);

    Http::fake();

    $this->get(route('admin.orders.show', $order))->assertOk();

    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'pathao'));
});

test('opening an order still renders when the courier auto-refresh call fails', function () {
    actingAsAdmin();

    $order = Order::factory()->create(['courier_consignment_id' => 'CONSIGN-1', 'courier_provider' => 'pathao']);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([], 500),
    ]);

    $this->get(route('admin.orders.show', $order))->assertOk();
});
