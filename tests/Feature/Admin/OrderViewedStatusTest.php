<?php

use App\Models\Order;
use App\Models\User;

test('new orders are marked as new in the orders index', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $this->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page->where('orders.data.0.is_new', true));

    expect($order->fresh()->viewed_at)->toBeNull();
});

test('opening an order marks it as viewed and it no longer appears as new', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $this->get(route('admin.orders.show', $order));

    expect($order->fresh()->viewed_at)->not->toBeNull();

    $this->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page->where('orders.data.0.is_new', false));
});

test('reopening an already-viewed order does not change its viewed_at timestamp', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $this->get(route('admin.orders.show', $order));
    $firstViewedAt = $order->fresh()->viewed_at;

    $this->travel(5)->minutes();
    $this->get(route('admin.orders.show', $order));

    expect($order->fresh()->viewed_at)->toEqual($firstViewedAt);
});

test('the shared pending orders count only includes unviewed orders and decreases as orders are opened', function () {
    $this->actingAsAdmin();
    $orders = Order::factory()->count(3)->create();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('pendingOrdersCount', 3));

    $this->get(route('admin.orders.show', $orders->first()));

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('pendingOrdersCount', 2));
});

test('the shared pending orders count is null for non-admin users', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $this->actingAs($user);
    Order::factory()->create();

    $this->get(route('profile.edit'))
        ->assertInertia(fn ($page) => $page->where('pendingOrdersCount', null));
});
