<?php

use App\Models\Order;
use App\Models\Setting;

test('no tracking code renders on the storefront when nothing is configured', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertDontSee('googletagmanager.com', false)
        ->assertDontSee('fbevents.js', false);
});

test('configured head and body code render verbatim on the storefront home page', function () {
    Setting::set('head_code', '<script>console.log("head-marker-123")</script>');
    Setting::set('body_code', '<noscript>body-marker-456</noscript>');

    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertSee('head-marker-123', false)
        ->assertSee('body-marker-456', false);
});

test('configured head code also renders on the order confirmation page', function () {
    Setting::set('head_code', '<script>console.log("head-marker-123")</script>');
    $order = Order::factory()->create();

    $response = $this->get(route('orders.confirmation', $order->order_number));

    $response->assertOk()->assertSee('head-marker-123', false);
});

test('tracking code never renders on an admin page even when configured', function () {
    Setting::set('head_code', '<script>console.log("head-marker-123")</script>');
    Setting::set('body_code', '<noscript>body-marker-456</noscript>');
    $this->actingAsAdmin();

    $response = $this->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertDontSee('head-marker-123', false)
        ->assertDontSee('body-marker-456', false);
});

test('tracking code never renders on the login page', function () {
    Setting::set('head_code', '<script>console.log("head-marker-123")</script>');

    $response = $this->get(route('login'));

    $response->assertOk()->assertDontSee('head-marker-123', false);
});
