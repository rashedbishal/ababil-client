<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductVariantRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductVariantController extends Controller
{
    public function store(ProductVariantRequest $request, Product $product): RedirectResponse
    {
        $product->variants()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant added.']);

        return back();
    }

    public function update(ProductVariantRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        abort_unless($variant->product_id === $product->id, 404);

        $variant->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant updated.']);

        return back();
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        abort_unless($variant->product_id === $product->id, 404);

        $variant->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant removed.']);

        return back();
    }
}
