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
        'customer_phone' => '01700000000',
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

test('tracking against a session token that already converted to an order starts a new row instead of overwriting it', function () {
    $converted = IncompleteOrder::query()->create([
        'session_token' => 'old-converted-session',
        'customer_phone' => '01700000000',
        'conversion_status' => IncompleteOrderConversionStatus::Converted,
    ]);

    $response = $this->post(route('incomplete-orders.store'), [
        'session_token' => 'old-converted-session',
        'customer_name' => 'New Visitor',
        'customer_phone' => '01799999999',
    ]);

    $response->assertOk();
    $returnedToken = $response->json('session_token');

    expect($returnedToken)->not->toBe('old-converted-session');

    $converted->refresh();
    expect($converted->customer_phone)->toBe('01700000000')
        ->and($converted->conversion_status)->toBe(IncompleteOrderConversionStatus::Converted);

    $newRow = IncompleteOrder::query()->where('session_token', $returnedToken)->first();

    expect($newRow)->not->toBeNull()
        ->and($newRow->customer_name)->toBe('New Visitor')
        ->and($newRow->customer_phone)->toBe('01799999999')
        ->and($newRow->conversion_status)->toBe(IncompleteOrderConversionStatus::Pending);
});

test('tracking a fresh, non-converted session echoes back the same session token', function () {
    $response = $this->post(route('incomplete-orders.store'), [
        'session_token' => 'session-abc',
        'customer_name' => 'Jane Doe',
        'customer_phone' => '01711111111',
    ]);

    $response->assertOk();
    expect($response->json('session_token'))->toBe('session-abc');
});

test('a checkout session is not tracked as an incomplete order until a phone number is given', function () {
    $this->post(route('incomplete-orders.store'), [
        'session_token' => 'session-abc',
        'customer_name' => 'Jane Doe',
    ]);

    expect(IncompleteOrder::query()->where('session_token', 'session-abc')->exists())->toBeFalse();

    $this->post(route('incomplete-orders.store'), [
        'session_token' => 'session-abc',
        'customer_name' => 'Jane Doe',
        'customer_phone' => '01711111111',
    ]);

    expect(IncompleteOrder::query()->where('session_token', 'session-abc')->exists())->toBeTrue();
});
