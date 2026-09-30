<?php

use App\Models\Product;
use App\Models\User;

function productPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Sample Product',
        'slug' => 'sample-product',
        'sku' => 'SKU-SAMPLE-001',
        'regular_price' => '499.00',
        'weight' => '0.5',
        'track_stock' => true,
        'stock' => 5,
        'sort_order' => 0,
    ], $overrides);
}

test('the only product in the catalog cannot be set inactive on create', function () {
    config(['catalog.product_lock' => true]);
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)->post(route('admin.products.store'), productPayload(['is_active' => false]));

    $product = Product::where('sku', 'SKU-SAMPLE-001')->first();
    expect($product)->not->toBeNull()
        ->and($product->is_active)->toBeTrue();
});

test('a second product can be created inactive', function () {
    config(['catalog.product_lock' => true]);
    $admin = User::factory()->create(['is_admin' => true]);
    Product::factory()->create();

    $this->actingAs($admin)->post(route('admin.products.store'), productPayload(['is_active' => false]));

    $product = Product::where('sku', 'SKU-SAMPLE-001')->first();
    expect($product->is_active)->toBeFalse();
});

test('the create page reports visibility cannot be set when the catalog is empty', function () {
    config(['catalog.product_lock' => true]);
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)->get(route('admin.products.create'))
        ->assertInertia(fn ($page) => $page->where('canSetVisibility', false));

    Product::factory()->create();

    $this->actingAs($admin)->get(route('admin.products.create'))
        ->assertInertia(fn ($page) => $page->where('canSetVisibility', true));
});

test('the sole existing product cannot be deactivated on update', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $product = Product::factory()->create(['is_active' => true]);

    $this->actingAs($admin)->get(route('admin.products.edit', $product))
        ->assertInertia(fn ($page) => $page->where('canSetVisibility', false));

    $this->actingAs($admin)->patch(route('admin.products.update', $product), productPayload([
        'slug' => $product->slug,
        'sku' => $product->sku,
        'is_active' => false,
    ]));

    expect($product->fresh()->is_active)->toBeTrue();
});

test('a product can be deactivated once a second product exists', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $product = Product::factory()->create(['is_active' => true]);
    Product::factory()->create();

    $this->actingAs($admin)->get(route('admin.products.edit', $product))
        ->assertInertia(fn ($page) => $page->where('canSetVisibility', true));

    $this->actingAs($admin)->patch(route('admin.products.update', $product), productPayload([
        'slug' => $product->slug,
        'sku' => $product->sku,
        'is_active' => false,
    ]));

    expect($product->fresh()->is_active)->toBeFalse();
});
