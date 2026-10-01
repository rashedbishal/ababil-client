<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;

beforeEach(function () {
    config(['catalog.size_set' => true]);
});

test('an admin can add a variant to a product', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $size = Size::factory()->create();

    $response = $this->post(route('admin.products.variants.store', $product), [
        'size_id' => $size->id,
        'sku' => 'TEE-RED-M',
        'stock' => 10,
        'is_active' => true,
    ]);

    $response->assertRedirect();
    expect(ProductVariant::query()->where('sku', 'TEE-RED-M')->exists())->toBeTrue();
});

test('an admin can update a variant', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $variant = ProductVariant::factory()->for($product)->create(['stock' => 5]);

    $response = $this->patch(route('admin.products.variants.update', [$product, $variant]), [
        'sku' => $variant->sku,
        'stock' => 20,
        'is_active' => true,
    ]);

    $response->assertRedirect();
    expect($variant->fresh()->stock)->toBe(20);
});

test('an admin can remove a variant', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $variant = ProductVariant::factory()->for($product)->create();

    $response = $this->delete(route('admin.products.variants.destroy', [$product, $variant]));

    $response->assertRedirect();
    expect(ProductVariant::query()->find($variant->id))->toBeNull();
});

test('a variant belonging to a different product cannot be updated through this product', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $otherProduct = Product::factory()->create();
    $variant = ProductVariant::factory()->for($otherProduct)->create();

    $response = $this->patch(route('admin.products.variants.update', [$product, $variant]), [
        'sku' => $variant->sku,
        'stock' => 99,
    ]);

    $response->assertNotFound();
});

test('two variants of the same product cannot share a sku', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    ProductVariant::factory()->for($product)->create(['sku' => 'DUP-SKU']);

    $response = $this->post(route('admin.products.variants.store', $product), [
        'sku' => 'DUP-SKU',
        'stock' => 5,
    ]);

    $response->assertSessionHasErrors('sku');
});
