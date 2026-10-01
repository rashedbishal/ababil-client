<?php

use App\Models\Product;
use App\Models\ShippingArea;

test('the landing page shows the active featured product', function () {
    Product::factory()->create(['name' => 'Ababil Hair Oil', 'is_active' => true, 'sort_order' => 0]);
    ShippingArea::factory()->create(['is_active' => true]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('product.name', 'Ababil Hair Oil'));
});

test('the landing page renders with no product when the catalog is empty', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('product', null));
});

test('an inactive product is not shown on the landing page', function () {
    Product::factory()->create(['is_active' => false]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('product', null));
});
