<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $products = Product::query()
            ->withCount('variants')
            // Deliberately a substring search (not prefix-only): admins
            // reasonably search by a partial product name or a fragment of
            // a SKU. The catalog here is tiny by design (a single-product
            // storefront), so the full scan this implies is not worth
            // trading away that flexibility for - revisit only if the
            // catalog ever grows large.
            ->when($request->string('search')->trim()->toString(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->when($request->string('status')->toString(), function ($query, string $status): void {
                match ($status) {
                    'active' => $query->where('is_active', true),
                    'inactive' => $query->where('is_active', false),
                    'archived' => $query->onlyTrashed(),
                    default => null,
                };
            }, function ($query): void {
                $query->withoutTrashed();
            })
            ->orderBy('sort_order')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => $products->through(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'regular_price' => (string) $product->regular_price,
                'sale_price' => $product->sale_price !== null ? (string) $product->sale_price : null,
                'stock' => $product->stock,
                'variants_count' => $product->variants_count,
                'is_active' => $product->is_active,
                'is_archived' => $product->trashed(),
            ]),
            'filters' => $request->only(['search', 'status']),
            'canCreateProducts' => (bool) config('catalog.product_lock'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            // A brand-new product only gets a visibility choice if it won't
            // be the sole product in the catalog - the storefront needs at
            // least one active product to show.
            'canSetVisibility' => Product::query()->count() > 0,
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if (Product::query()->count() === 0) {
            $data['is_active'] = true;
        }

        $product = Product::query()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return to_route('admin.products.edit', $product);
    }

    public function edit(Product $product): Response
    {
        $product->load('variants.size');

        return Inertia::render('admin/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'regular_price' => (string) $product->regular_price,
                'sale_price' => $product->sale_price !== null ? (string) $product->sale_price : null,
                'track_stock' => $product->track_stock,
                'stock' => $product->stock,
                'weight' => (string) $product->weight,
                'free_delivery' => $product->free_delivery,
                'is_active' => $product->is_active,
                'meta_title' => $product->meta_title,
                'meta_description' => $product->meta_description,
                'sort_order' => $product->sort_order,
                'variants' => $product->variants->map(fn (ProductVariant $variant) => [
                    'id' => $variant->id,
                    'size_id' => $variant->size_id,
                    'size_name' => $variant->size?->name,
                    'sku' => $variant->sku,
                    'price_override' => $variant->price_override !== null ? (string) $variant->price_override : null,
                    'stock' => $variant->stock,
                    'is_active' => $variant->is_active,
                ]),
            ],
            'sizes' => Size::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
            // If this is the only product in the whole catalog, it must stay
            // active - there'd otherwise be nothing for the storefront to show.
            'canSetVisibility' => Product::query()->count() > 1,
            'sizeManagementEnabled' => (bool) config('catalog.size_set'),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        if (Product::query()->count() === 1) {
            $data['is_active'] = true;
        }

        $product->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return back();
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product archived.']);

        return back();
    }

    public function restore(int $product): RedirectResponse
    {
        Product::withTrashed()->findOrFail($product)->restore();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product restored.']);

        return back();
    }
}
