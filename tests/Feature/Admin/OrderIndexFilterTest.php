<?php

use App\Enums\OrderStatus;
use App\Models\Order;

test('the orders index filters by status', function () {
    $this->actingAsAdmin();

    Order::factory()->create(['status' => OrderStatus::Pending]);
    Order::factory()->create(['status' => OrderStatus::Delivered]);

    $this->get(route('admin.orders.index', ['status' => OrderStatus::Delivered->value]))
        ->assertInertia(fn ($page) => $page
            ->where('orders.data', fn ($data) => count($data) === 1)
            ->where('orders.data.0.status', OrderStatus::Delivered->value));
});
