<?php

use App\Enums\IncompleteOrderConversionStatus;
use App\Models\BlockedIp;
use App\Models\IncompleteOrder;
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
        'form_token' => encrypt(now()->subSeconds(10)->timestamp),
    ], $overrides);
}

test('a customer can place an order without authentication', function () {
    $product = Product::factory()->create(['regular_price' => 1000, 'sale_price' => null, 'track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 80, 'is_active' => true]);

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 2]));

    $this->assertGuest();
    $order = Order::first();
    expect($order)->not->toBeNull();
    // The storefront shows the result in a modal on the same page instead
    // of navigating to a separate confirmation route.
    $response->assertSessionHasNoErrors();
    $response->assertRedirect();
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

test('a free-delivery product waives the shipping charge regardless of the selected area', function () {
    $product = Product::factory()->create(['regular_price' => 300, 'sale_price' => null, 'track_stock' => true, 'stock' => 10, 'free_delivery' => true]);
    $shippingArea = ShippingArea::factory()->create(['charge' => 120]);

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, ['quantity' => 2]));

    $order = Order::first();
    expect((string) $order->shipping_charge)->toBe('0.00')
        ->and((string) $order->grand_total)->toBe('600.00');
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

test('a blocked ip placing an order via inertia gets a redirect-with-errors, not a raw 403 page', function () {
    BlockedIp::factory()->create(['ip_address' => '127.0.0.1', 'is_active' => true]);

    $product = Product::factory()->create();
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->withHeaders(['X-Inertia' => 'true'])
        ->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    $response->assertSessionHasErrors('order');
    expect(Order::count())->toBe(0);
});

test('a blocked ip still blocks when the request arrives as its IPv4-mapped IPv6 form', function () {
    BlockedIp::factory()->create(['ip_address' => '127.0.0.1', 'is_active' => true]);

    $product = Product::factory()->create();
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->withServerVariables(['REMOTE_ADDR' => '::ffff:127.0.0.1'])
        ->post(route('orders.store'), validOrderPayload($product, $shippingArea));

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

test('a delivery address shorter than 10 characters is rejected', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'delivery_address' => 'Dhaka',
    ]));

    $response->assertSessionHasErrors(['delivery_address']);
    expect(Order::count())->toBe(0);
});

test('a filled-in honeypot field rejects the order with a generic, visible error', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'website' => 'https://spammer.example',
    ]));

    // Surfaced under 'order' - the same field the frontend's checkout form
    // actually displays - not just under 'website', which nothing renders.
    // A honeypot trips just as easily from browser/extension autofill as
    // from a bot, so a real shopper must still see why their order failed.
    $response->assertSessionHasErrors('order');
    expect(Order::count())->toBe(0);
});

test('a submission arriving faster than the minimum time on page is rejected', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'form_token' => encrypt(now()->timestamp),
    ]));

    $response->assertSessionHasErrors('order');
    expect(Order::count())->toBe(0);
});

test('a stale form token is rejected', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'form_token' => encrypt(now()->subHours(7)->timestamp),
    ]));

    $response->assertSessionHasErrors('order');
    expect(Order::count())->toBe(0);
});

test('a tampered form token is rejected', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'form_token' => 'not-a-real-token',
    ]));

    $response->assertSessionHasErrors('order');
    expect(Order::count())->toBe(0);
});

test('a phone number that does not match the Bangladeshi mobile format is rejected', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'customer_phone' => '12345',
    ]));

    $response->assertSessionHasErrors('customer_phone');
    expect(Order::count())->toBe(0);
});

test('a phone number is blocked from placing more than the daily order cap', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 100]);
    $shippingArea = ShippingArea::factory()->create();

    config(['orders.max_orders_per_phone_per_day' => 2]);

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));
    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    expect(Order::count())->toBe(2);

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    $response->assertSessionHasErrors('order');
    expect(Order::count())->toBe(2);
});

test('a near-duplicate order from the same phone is flagged for admin review instead of blocked', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 100]);
    $shippingArea = ShippingArea::factory()->create();

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));
    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'form_token' => encrypt(now()->subSeconds(10)->timestamp),
    ]));

    expect(Order::count())->toBe(2);

    $latest = Order::query()->latest()->first();
    expect($latest->admin_note)->toContain('Possible duplicate');
});

test('a rare order-number collision at insert time is retried instead of returning a server error', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $collided = false;

    // Simulates another request inserting this exact order_number between
    // generateOrderNumber()'s own existence check and this create() call -
    // the one window PlaceOrderAction::createOrder()'s retry exists for.
    Order::creating(function (Order $order) use (&$collided) {
        if (! $collided) {
            $collided = true;
            Order::factory()->create(['order_number' => $order->order_number]);
        }
    });

    $response = $this->post(route('orders.store'), validOrderPayload($product, $shippingArea));

    $response->assertSessionHasNoErrors();
    expect(Order::count())->toBe(2)
        ->and($collided)->toBeTrue();

    $realOrder = Order::query()->where('customer_name', 'Jane Doe')->first();
    expect($realOrder)->not->toBeNull();
});

test('completing checkout converts the matching incomplete order for the same session', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();
    $incomplete = IncompleteOrder::query()->create([
        'session_token' => 'session-to-convert',
        'conversion_status' => IncompleteOrderConversionStatus::Pending,
    ]);

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'session_token' => 'session-to-convert',
    ]));

    $order = Order::first();
    expect($order)->not->toBeNull();

    $incomplete->refresh();
    expect($incomplete->conversion_status)->toBe(IncompleteOrderConversionStatus::Converted)
        ->and($incomplete->order_id)->toBe($order->id);
});

test('completing checkout does not convert an incomplete order from a different session', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();
    $unrelated = IncompleteOrder::query()->create([
        'session_token' => 'unrelated-session',
        'conversion_status' => IncompleteOrderConversionStatus::Pending,
    ]);

    $this->post(route('orders.store'), validOrderPayload($product, $shippingArea, [
        'session_token' => 'session-that-does-not-match-anything',
    ]));

    $unrelated->refresh();
    expect($unrelated->conversion_status)->toBe(IncompleteOrderConversionStatus::Pending)
        ->and($unrelated->order_id)->toBeNull();
});

test('completing checkout without a session token does not touch any incomplete order', function () {
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();
    $incomplete = IncompleteOrder::query()->create([
        'session_token' => 'some-other-session',
        'conversion_status' => IncompleteOrderConversionStatus::Pending,
    ]);

    $payload = validOrderPayload($product, $shippingArea);
    unset($payload['session_token']);

    $this->post(route('orders.store'), $payload);

    expect(Order::count())->toBe(1);
    $incomplete->refresh();
    expect($incomplete->conversion_status)->toBe(IncompleteOrderConversionStatus::Pending);
});
