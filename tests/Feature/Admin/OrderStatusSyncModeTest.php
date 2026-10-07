<?php

use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('new orders default to automated status sync', function () {
    $order = Order::factory()->create();

    expect($order->fresh()->status_sync_mode->value)->toBe('automated');
});

test('an admin cannot manually change the status of an automated order', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $response = $this->actingAs($admin)->patch(route('admin.orders.update', $order), [
        'status' => OrderStatus::Shipped->value,
    ]);

    $response->assertSessionHasErrors('status');
    expect($order->fresh()->status)->toBe(OrderStatus::Pending);
});

test('an admin can manually change the status once the order is switched to manual mode', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'status_sync_mode' => 'manual',
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.orders.update', $order), [
        'status' => OrderStatus::Shipped->value,
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect($order->fresh()->status)->toBe(OrderStatus::Shipped);
});

test('a non-admin cannot change the status sync mode', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $order = Order::factory()->create();

    $response = $this->actingAs($user)->patch(route('admin.orders.status-sync-mode', $order), [
        'status_sync_mode' => 'manual',
    ]);

    $response->assertForbidden();
});

test('switching back to automated immediately re-syncs the order status from the last known courier status', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'manual',
        'courier_status' => 'in_transit',
    ]);

    $response = $this->actingAs($admin)->patch(route('admin.orders.status-sync-mode', $order), [
        'status_sync_mode' => 'automated',
    ]);

    $response->assertRedirect();
    $order->refresh();

    expect($order->status_sync_mode->value)->toBe('automated')
        ->and($order->status)->toBe(OrderStatus::Shipped);
});

test('refreshing courier status on an automated order syncs the order status', function () {
    $admin = User::factory()->create(['is_admin' => true]);

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
    ]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Delivery'],
        ]),
    ]);

    $this->actingAs($admin)->post(route('admin.orders.courier.refresh', $order));

    expect($order->fresh()->status)->toBe(OrderStatus::Delivered);
});

test('a pickup_cancelled courier status auto-cancels an automated order and restores its stock', function () {
    $admin = User::factory()->create(['is_admin' => true]);

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

    $product = Product::factory()->create(['track_stock' => true, 'stock' => 5]);
    $order = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'courier_consignment_id' => 'CONSIGN-1',
        'courier_provider' => 'pathao',
    ]);
    OrderItem::factory()->for($order)->for($product)->create(['variant_id' => null, 'quantity' => 2]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Pickup_Cancelled'],
        ]),
    ]);

    $this->actingAs($admin)->post(route('admin.orders.courier.refresh', $order));

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($product->fresh()->stock)->toBe(7);
});

test('refreshing courier status on a manual order does not change the order status', function () {
    $admin = User::factory()->create(['is_admin' => true]);

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
        'status_sync_mode' => 'manual',
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
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => 'Delivery'],
        ]),
    ]);

    $this->actingAs($admin)->post(route('admin.orders.courier.refresh', $order));

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::CourierSubmitted)
        ->and($order->courier_status->value)->toBe('delivery');
});
