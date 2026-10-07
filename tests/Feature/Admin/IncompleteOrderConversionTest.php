<?php

use App\Enums\IncompleteOrderConversionStatus;
use App\Models\IncompleteOrder;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingArea;
use App\Models\User;

function incompleteOrderPayload(array $overrides = []): array
{
    $product = Product::factory()->create(['stock' => 10]);
    $area = ShippingArea::factory()->create();

    return array_merge([
        'session_token' => 'session-'.uniqid(),
        'product_id' => $product->id,
        'quantity' => 2,
        'customer_name' => null,
        'customer_phone' => '01711111111',
        'delivery_address' => null,
        'shipping_area_id' => $area->id,
        'customer_ip' => '203.0.113.5',
        'user_agent' => 'Mozilla/5.0',
        'last_activity_at' => now(),
    ], $overrides);
}

test('an admin can convert an incomplete order into a real order', function () {
    $this->actingAsAdmin();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload());

    $response = $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Jane Doe',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $order = Order::query()->latest()->first();
    expect($order)->not->toBeNull()
        ->and($order->customer_name)->toBe('Jane Doe')
        ->and($order->delivery_address)->toBe('House 12, Road 5, Dhanmondi, Dhaka')
        ->and($order->customer_phone)->toBe('01711111111')
        ->and($order->customer_ip)->toBe('203.0.113.5');

    expect($incomplete->fresh())
        ->conversion_status->toBe(IncompleteOrderConversionStatus::Converted)
        ->order_id->toBe($order->id);
});

test('the name field is prefilled but the converted order can still change it', function () {
    $this->actingAsAdmin();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload([
        'customer_name' => 'Original Name',
    ]));

    $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Corrected Name',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $order = Order::query()->latest()->first();
    expect($order->customer_name)->toBe('Corrected Name');
});

test('a converted incomplete order no longer appears in the index', function () {
    $this->actingAsAdmin();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload());

    $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Jane Doe',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $this->get(route('admin.incomplete-orders.index'))
        ->assertInertia(fn ($page) => $page
            ->where('incompleteOrders.data', []));
});

test('a short delivery address is rejected', function () {
    $this->actingAsAdmin();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload());

    $response = $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Jane Doe',
        'delivery_address' => 'short',
    ]);

    $response->assertSessionHasErrors('delivery_address');
    expect(Order::query()->count())->toBe(0);
    expect($incomplete->fresh()->conversion_status)->toBe(IncompleteOrderConversionStatus::Pending);
});

test('a missing name is rejected', function () {
    $this->actingAsAdmin();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload());

    $response = $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => '',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $response->assertSessionHasErrors('customer_name');
    expect(Order::query()->count())->toBe(0);
});

test('a checkout missing product, quantity, or shipping area cannot be converted', function () {
    $this->actingAsAdmin();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload([
        'product_id' => null,
    ]));

    $response = $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Jane Doe',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $response->assertRedirect();
    expect(Order::query()->count())->toBe(0);
    expect($incomplete->fresh()->conversion_status)->toBe(IncompleteOrderConversionStatus::Pending);
});

test('an already-converted incomplete order cannot be converted again', function () {
    $this->actingAsAdmin();
    $existingOrder = Order::factory()->create();
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload([
        'conversion_status' => 'converted',
        'order_id' => $existingOrder->id,
    ]));

    $response = $this->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Jane Doe',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $response->assertRedirect();
    expect(Order::query()->count())->toBe(1);
});

test('a non-admin cannot convert an incomplete order', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $incomplete = IncompleteOrder::query()->create(incompleteOrderPayload());

    $response = $this->actingAs($user)->post(route('admin.incomplete-orders.convert', $incomplete), [
        'customer_name' => 'Jane Doe',
        'delivery_address' => 'House 12, Road 5, Dhanmondi, Dhaka',
    ]);

    $response->assertForbidden();
    expect(Order::query()->count())->toBe(0);
});
