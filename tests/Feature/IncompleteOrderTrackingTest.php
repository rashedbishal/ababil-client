<?php

use App\Enums\IncompleteOrderConversionStatus;
use App\Models\IncompleteOrder;
use App\Models\Product;

test('tracking a checkout session creates an incomplete order', function () {
    $product = Product::factory()->create();

    $response = $this->post(route('incomplete-orders.store'), [
        'session_token' => 'session-abc',
        'product_id' => $product->id,
        'quantity' => 2,
        'customer_name' => 'Jane Doe',
        'customer_phone' => '01700000000',
    ]);

    $response->assertOk();

    $incomplete = IncompleteOrder::query()->where('session_token', 'session-abc')->first();

    expect($incomplete)->not->toBeNull()
        ->and($incomplete->product_id)->toBe($product->id)
        ->and($incomplete->quantity)->toBe(2)
        ->and($incomplete->customer_name)->toBe('Jane Doe')
        ->and($incomplete->conversion_status)->toBe(IncompleteOrderConversionStatus::Pending)
        ->and($incomplete->last_activity_at)->not->toBeNull();
});

test('tracking the same checkout session again updates the existing row instead of creating a new one', function () {
    $this->post(route('incomplete-orders.store'), [
        'session_token' => 'session-abc',
        'customer_name' => 'Jane Doe',
    ]);

    $this->post(route('incomplete-orders.store'), [
        'session_token' => 'session-abc',
        'customer_name' => 'Jane Updated',
        'customer_phone' => '01711111111',
    ]);

    expect(IncompleteOrder::query()->where('session_token', 'session-abc')->count())->toBe(1);

    $incomplete = IncompleteOrder::query()->where('session_token', 'session-abc')->first();

    expect($incomplete->customer_name)->toBe('Jane Updated')
        ->and($incomplete->customer_phone)->toBe('01711111111');
});
