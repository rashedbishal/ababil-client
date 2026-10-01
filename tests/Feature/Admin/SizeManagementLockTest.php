<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;

test('the sizes admin pages 403 while size management is disabled', function () {
    config(['catalog.size_set' => false]);
    $this->actingAsAdmin();
    $size = Size::factory()->create();

    $this->get(route('admin.sizes.index'))->assertForbidden();
    $this->post(route('admin.sizes.store'), ['name' => 'Jumbo', 'slug' => 'jumbo'])->assertForbidden();
    $this->patch(route('admin.sizes.update', $size), ['name' => 'Jumbo', 'slug' => 'jumbo'])->assertForbidden();
    $this->delete(route('admin.sizes.destroy', $size))->assertForbidden();

    expect(Size::query()->where('slug', 'jumbo')->exists())->toBeFalse();
    expect(Size::query()->find($size->id))->not->toBeNull();
});

test('the sizes admin pages work once size management is enabled', function () {
    config(['catalog.size_set' => true]);
    $this->actingAsAdmin();

    $this->get(route('admin.sizes.index'))->assertOk();

    $response = $this->post(route('admin.sizes.store'), [
        'name' => 'XL', 'slug' => 'xl', 'sort_order' => 0, 'is_active' => true,
    ]);

    $response->assertRedirect();
    expect(Size::query()->where('slug', 'xl')->exists())->toBeTrue();
});

test('product variant routes 403 while size management is disabled', function () {
    config(['catalog.size_set' => false]);
    $this->actingAsAdmin();

    $product = Product::factory()->create();
    $variant = ProductVariant::factory()->for($product)->create();
    $originalStock = $variant->stock;

    $this->post(route('admin.products.variants.store', $product), [
        'sku' => 'NEW-SKU', 'stock' => 5,
    ])->assertForbidden();

    $this->patch(route('admin.products.variants.update', [$product, $variant]), [
        'sku' => $variant->sku, 'stock' => 99,
    ])->assertForbidden();

    $this->delete(route('admin.products.variants.destroy', [$product, $variant]))->assertForbidden();

    expect($variant->fresh()->stock)->toBe($originalStock)
        ->and(ProductVariant::query()->where('sku', 'NEW-SKU')->exists())->toBeFalse();
});

test('product variant routes work once size management is enabled', function () {
    config(['catalog.size_set' => true]);
    $this->actingAsAdmin();

    $product = Product::factory()->create();

    $response = $this->post(route('admin.products.variants.store', $product), [
        'sku' => 'NEW-SKU', 'stock' => 5,
    ]);

    $response->assertRedirect();
    expect(ProductVariant::query()->where('sku', 'NEW-SKU')->exists())->toBeTrue();
});

test('the sidebar and product edit page expose whether size management is enabled', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();

    config(['catalog.size_set' => true]);
    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('sizeManagementEnabled', true));
    $this->get(route('admin.products.edit', $product))
        ->assertInertia(fn ($page) => $page->where('sizeManagementEnabled', true));

    config(['catalog.size_set' => false]);
    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('sizeManagementEnabled', false));
    $this->get(route('admin.products.edit', $product))
        ->assertInertia(fn ($page) => $page->where('sizeManagementEnabled', false));
});
