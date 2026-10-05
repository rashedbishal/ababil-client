<?php

use App\Models\Order;
use App\Models\Setting;

test('no tracking scripts render on the storefront when nothing is configured', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertDontSee('googletagmanager.com', false)
        ->assertDontSee('fbevents.js', false)
        ->assertDontSee('fbq(', false);
});

test('configured tracking ids render on the storefront home page', function () {
    Setting::set('google_tag_manager_id', 'GTM-ABC1234');
    Setting::set('facebook_pixel_id', '1234567890');
    Setting::set('google_analytics_id', 'G-TESTGA123');

    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertSee('GTM-ABC1234', false)
        ->assertSee('ns.html?id=GTM-ABC1234', false)
        ->assertSee("fbq('init', '1234567890')", false)
        ->assertSee('facebook.com/tr?id=1234567890', false)
        ->assertSee('googletagmanager.com/gtag/js?id=G-TESTGA123', false);
});

test('configured tracking ids also render on the order confirmation page', function () {
    Setting::set('facebook_pixel_id', '1234567890');
    $order = Order::factory()->create();

    $response = $this->get(route('orders.confirmation', $order->order_number));

    $response->assertOk()->assertSee("fbq('init', '1234567890')", false);
});

test('tracking scripts never render on an admin page even when configured', function () {
    Setting::set('google_tag_manager_id', 'GTM-ABC1234');
    Setting::set('facebook_pixel_id', '1234567890');
    Setting::set('google_analytics_id', 'G-TESTGA123');
    $this->actingAsAdmin();

    $response = $this->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertDontSee('googletagmanager.com', false)
        ->assertDontSee('fbevents.js', false);
});

test('tracking scripts never render on the login page', function () {
    Setting::set('facebook_pixel_id', '1234567890');

    $response = $this->get(route('login'));

    $response->assertOk()->assertDontSee('fbevents.js', false);
});
