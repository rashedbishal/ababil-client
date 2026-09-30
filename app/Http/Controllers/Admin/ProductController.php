<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Models\Media;
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
            ->with('featuredImage')
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
                'featured_image_url' => $product->featuredImage?->url(),
            ]),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'media' => $this->mediaOptions(),
        ]);
    }

    public function store(ProductRequest $request): RedirectResponse
    {
        $product = Product::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return to_route('admin.products.edit', $product);
    }

    public function edit(Product $product): Response
    {
        $product->load(['variants.size', 'featuredImage']);

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
                'featured_image_id' => $product->featured_image_id,
                'featured_image_url' => $product->featuredImage?->url(),
                'track_stock' => $product->track_stock,
                'stock' => $product->stock,
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
            'media' => $this->mediaOptions(),
            'sizes' => Size::query()->where('is_active', true)->orderBy('sort_order')->get(['id', 'name']),
        ]);
    }

    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

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

    /**
     * @return array<int, array{id: int, url: string, filename: string}>
     */
    private function mediaOptions(): array
    {
        return Media::query()
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn (Media $media) => [
                'id' => $media->id,
                'url' => $media->url(),
                'filename' => $media->original_filename,
            ])
            ->all();
    }
}
