<?php

use App\Models\Product;

test('an admin can archive (soft-delete) a product', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();

    $response = $this->delete(route('admin.products.destroy', $product));

    $response->assertRedirect();
    expect(Product::query()->find($product->id))->toBeNull()
        ->and(Product::withTrashed()->find($product->id))->not->toBeNull();
});

test('an admin can restore an archived product', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $product->delete();

    $response = $this->post(route('admin.products.restore', $product->id));

    $response->assertRedirect();
    expect(Product::query()->find($product->id))->not->toBeNull();
});
