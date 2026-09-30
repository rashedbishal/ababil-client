<?php

use App\Models\Product;
use App\Models\User;

function validProductPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'New Product',
        'slug' => 'new-product',
        'sku' => 'SKU-NEW-001',
        'regular_price' => '999.00',
        'weight' => '0.5',
        'track_stock' => true,
        'stock' => 10,
        'is_active' => true,
        'sort_order' => 0,
    ], $overrides);
}

test('an admin can visit the create page and add a product when the catalog is unlocked', function () {
    config(['catalog.product_lock' => true]);
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)->get(route('admin.products.create'))->assertOk();

    $response = $this->actingAs($admin)->post(route('admin.products.store'), validProductPayload());

    $response->assertRedirect();
    expect(Product::where('sku', 'SKU-NEW-001')->exists())->toBeTrue();
});

test('an admin cannot visit the create page or add a product when the catalog is locked', function () {
    config(['catalog.product_lock' => false]);
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)->get(route('admin.products.create'))->assertForbidden();

    $response = $this->actingAs($admin)->post(route('admin.products.store'), validProductPayload());

    $response->assertForbidden();
    expect(Product::where('sku', 'SKU-NEW-001')->exists())->toBeFalse();
});

test('the products index only exposes the add-product action when the catalog is unlocked', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    config(['catalog.product_lock' => true]);
    $this->actingAs($admin)->get(route('admin.products.index'))
        ->assertInertia(fn ($page) => $page->where('canCreateProducts', true));

    config(['catalog.product_lock' => false]);
    $this->actingAs($admin)->get(route('admin.products.index'))
        ->assertInertia(fn ($page) => $page->where('canCreateProducts', false));
});

test('editing an existing product still works while the catalog is locked', function () {
    config(['catalog.product_lock' => false]);
    $admin = User::factory()->create(['is_admin' => true]);
    $product = Product::factory()->create();

    $response = $this->actingAs($admin)->patch(
        route('admin.products.update', $product),
        validProductPayload(['slug' => $product->slug, 'sku' => $product->sku, 'name' => 'Renamed Product']),
    );

    $response->assertRedirect();
    expect($product->fresh()->name)->toBe('Renamed Product');
});
