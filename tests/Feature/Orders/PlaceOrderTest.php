<?php

use App\Models\BlockedIp;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingArea;
use App\Models\Size;

function validOrderPayload(Product $product, ShippingArea $shippingArea, array $overrides = []): array
{
    return array_merge([
        'product_id' => $product->id,
        'variant_id' => null,
        'quantity' => 1,
        'customer_name' => 'Jane Doe',
        'customer_phone' => '01711111111',
        'delivery_address' => '123 Example Road, Dhaka',
        'shipping_area_id' => $shippingArea->id,
        'customer_note' => null,
    ], $overrides);
}

test('a customer can place an order without authentication', function () {
    $product = Product::factory()->create(['regular_price' => 1000, 'sale_price' => null, 'track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 80, 'is_active' => true]);

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 2]));

    $this->assertGuest();
    $order = Order::first();
    expect($order)->not->toBeNull();
    $response->assertRedirect(route('orders.confirmation', $order->order_number));
});

test('order creation persists a matching order item snapshot', function () {
    $product = Product::factory()->create(['name' => 'Classic Tee', 'sku' => 'TEE-001', 'regular_price' => 500, 'sale_price' => null, 'track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 60]);

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 3]));

    $item = OrderItem::first();
    expect($item)->not->toBeNull()
        ->and($item->product_name)->toBe('Classic Tee')
        ->and($item->sku)->toBe('TEE-001')
        ->and($item->quantity)->toBe(3)
        ->and((string) $item->unit_price)->toBe('500.00')
        ->and((string) $item->line_total)->toBe('1500.00');
});

test('a customer cannot order an inactive product', function () {
    $product = Product::factory()->create(['is_active' => false]);
    $shippingArea = ShippingArea::factory()->create();

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    expect(Order::count())->toBe(0);
});

test('a customer cannot order an inactive variant', function () {
    $product = Product::factory()->create();
    $size = Size::factory()->create();
    $variant = ProductVariant::factory()->for($product)->for($size)->create(['is_active' => false, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['variant_id' => $variant->id]));

    expect(Order::count())->toBe(0);
    $response->assertSessionHasErrors('order');
});

test('a customer cannot order more than the available stock', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 2]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 5]));

    expect(Order::count())->toBe(0);
    $response->assertSessionHasErrors('order');
});

test('placing an order decrements stock and a second order cannot oversell it', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 1]);
    $shippingArea = ShippingArea::factory()->create();

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 1]));

    expect(Order::count())->toBe(1)
        ->and($product->fresh()->stock)->toBe(0);

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 1]));

    expect(Order::count())->toBe(1);
});

test('the backend calculates the product price from the database, not the request', function () {
    $product = Product::factory()->create(['regular_price' => 750, 'sale_price' => null, 'track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 0]);

    $this->post(route('orders.store'), array_merge(
        validOrderPayload($product, $shippingArea, ['quantity' => 2]),
        ['unit_price' => '1', 'price' => '1'],
    ));

    $order = Order::first();
    expect((string) $order->subtotal)->toBe('1500.00');
});

test('the backend calculates the shipping charge from the database, not the request', function () {
    $product = Product::factory()->create(['regular_price' => 100, 'sale_price' => null, 'track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 45]);

    $this->post(route('orders.store'), array_merge(
        validOrderPayload($product, $shippingArea, ['quantity' => 1]),
        ['shipping_charge' => '0'],
    ));

    $order = Order::first();
    expect((string) $order->shipping_charge)->toBe('45.00');
});

test('frontend-submitted totals cannot manipulate the order grand total', function () {
    $product = Product::factory()->create(['regular_price' => 200, 'sale_price' => null, 'track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 20]);

    $this->post(route('orders.store'), array_merge(
        validOrderPayload($product, $shippingArea, ['quantity' => 1]),
        ['grand_total' => '1', 'subtotal' => '1', 'discount' => '999'],
    ));

    $order = Order::first();
    expect((string) $order->grand_total)->toBe('220.00')
        ->and((string) $order->discount)->toBe('0.00');
});

test('a blocked ip cannot place an order', function () {
    BlockedIp::factory()->create(['ip_address' => '127.0.0.1', 'is_active' => true]);

    $product = Product::factory()->create();
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    $response->assertForbidden();
    expect(Order::count())->toBe(0);
});

test('an expired blocked ip entry no longer blocks orders', function () {
    BlockedIp::factory()->expired()->create(['ip_address' => '127.0.0.1', 'is_active' => true]);

    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    expect(Order::count())->toBe(1);
});

test('placing an order requires the core customer fields', function () {
    $response = $this->post(route('orders.store'), []);

    $response->assertSessionHasErrors([
        'product_id',
        'quantity',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'shipping_area_id',
    ]);

    expect(Order::count())->toBe(0);
});
