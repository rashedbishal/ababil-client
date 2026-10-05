<?php

use App\Models\Order;

test('an admin can update the customer phone, address, and note on an order', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create([
        'customer_phone' => '01711111111',
        'delivery_address' => 'Old address, Dhaka',
        'customer_note' => 'Old note',
    ]);

    $response = $this->patch(route('admin.orders.update', $order), [
        'customer_phone' => '01822222222',
        'delivery_address' => 'New address, Chattogram',
        'customer_note' => 'New note',
    ]);

    $response->assertSessionHasNoErrors();
    expect($order->fresh())
        ->customer_phone->toBe('01822222222')
        ->delivery_address->toBe('New address, Chattogram')
        ->customer_note->toBe('New note');
});

test('updating customer details does not touch the order status', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => 'pending']);

    $this->patch(route('admin.orders.update', $order), [
        'delivery_address' => 'New address, Chattogram',
    ]);

    expect($order->fresh()->status->value)->toBe('pending');
});

test('an invalid phone number is rejected', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create(['customer_phone' => '01711111111']);

    $response = $this->patch(route('admin.orders.update', $order), [
        'customer_phone' => '123',
    ]);

    $response->assertSessionHasErrors('customer_phone');
    expect($order->fresh()->customer_phone)->toBe('01711111111');
});

test('a too-short delivery address is rejected', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create(['delivery_address' => 'Old address, Dhaka']);

    $response = $this->patch(route('admin.orders.update', $order), [
        'delivery_address' => 'short',
    ]);

    $response->assertSessionHasErrors('delivery_address');
    expect($order->fresh()->delivery_address)->toBe('Old address, Dhaka');
});
