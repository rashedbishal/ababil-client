<?php

use App\Models\BlockedIp;
use App\Models\Product;
use App\Models\ShippingArea;

/**
 * With TRUSTED_PROXIES unset (the default - see bootstrap/app.php),
 * Laravel trusts no proxy, so $request->ip() must come from the real TCP
 * connection (REMOTE_ADDR) and never from a client-supplied
 * X-Forwarded-For header. These tests pin that behavior down concretely
 * rather than relying on it being "obviously" true.
 */
test('an X-Forwarded-For header cannot be used to spoof a blocked ip when no proxy is trusted', function () {
    BlockedIp::factory()->create(['ip_address' => '9.9.9.9', 'is_active' => true]);
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 10]);
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '203.0.113.50',
        'HTTP_X_FORWARDED_FOR' => '9.9.9.9',
    ])->post(route('orders.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
        'customer_name' => 'Jane Doe',
        'customer_phone' => '01711111111',
        'delivery_address' => '123 Example Road, Dhaka',
        'shipping_area_id' => $shippingArea->id,
        'form_token' => encrypt(now()->subSeconds(10)->timestamp),
    ]);

    // Must NOT be forbidden: 9.9.9.9 is blocked but arrives only via a
    // client-supplied header, which is ignored since no proxy is trusted.
    $response->assertRedirect();
});

test('a blocked REMOTE_ADDR is still blocked regardless of X-Forwarded-For spoofing attempts', function () {
    BlockedIp::factory()->create(['ip_address' => '203.0.113.50', 'is_active' => true]);
    $product = Product::factory()->create();
    $shippingArea = ShippingArea::factory()->create();

    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '203.0.113.50',
        'HTTP_X_FORWARDED_FOR' => '1.2.3.4',
    ])->post(route('orders.store'), [
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $response->assertForbidden();
});
