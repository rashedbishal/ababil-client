<?php

use App\Models\Order;
use App\Models\OrderItem;

test('a customer can view their order confirmation', function () {
    $order = Order::factory()->create(['order_number' => 'ORD-260101-ABC123']);
    OrderItem::factory()->for($order)->create();

    $response = $this->get(route('orders.confirmation', 'ORD-260101-ABC123'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('order.order_number', 'ORD-260101-ABC123'));
});

test('an unknown order number returns a 404', function () {
    $this->get(route('orders.confirmation', 'NOT-A-REAL-ORDER'))->assertNotFound();
});

test('the order confirmation lookup is rate limited', function () {
    $order = Order::factory()->create(['order_number' => 'ORD-260101-ABC123']);
    OrderItem::factory()->for($order)->create();

    for ($i = 0; $i < 30; $i++) {
        $this->get(route('orders.confirmation', 'ORD-260101-ABC123'))->assertOk();
    }

    $this->get(route('orders.confirmation', 'ORD-260101-ABC123'))->assertStatus(429);
});
