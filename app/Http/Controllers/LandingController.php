<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\ShippingArea;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Show the temporary customer landing/checkout page.
     *
     * Only one product is featured for now (see AGENTS.md - this frontend is
     * intentionally minimal and will be redesigned later), but the schema
     * behind it supports many products.
     */
    public function show(): Response
    {
        $product = Product::query()
            ->where('is_active', true)
            ->with([
                'featuredImage',
                'images.media',
                'variants' => fn ($query) => $query->where('is_active', true)->with('size'),
            ])
            ->orderBy('sort_order')
            ->first();

        return Inertia::render('welcome', [
            'product' => $product ? $this->formatProduct($product) : null,
            'shippingAreas' => ShippingArea::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name', 'charge']),
            'contact' => [
                'phone' => Setting::get('site_phone'),
                'whatsapp' => Setting::get('whatsapp_number'),
                'facebookUrl' => Setting::get('facebook_page_url'),
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatProduct(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'short_description' => $product->short_description,
            'description' => $product->description,
            'regular_price' => (string) $product->regular_price,
            'sale_price' => $product->sale_price !== null ? (string) $product->sale_price : null,
            'sku' => $product->sku,
            'in_stock' => ! $product->track_stock || $product->stock > 0 || $product->hasVariants(),
            'featured_image_url' => $product->featuredImage?->url(),
            'gallery_urls' => $product->images->map(fn (ProductImage $image) => $image->media->url())->values(),
            'variants' => $product->variants->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'size' => $variant->size?->name,
                'stock' => $variant->stock,
                'in_stock' => $variant->stock > 0,
                'price' => $variant->currentPrice(),
            ])->values(),
        ];
    }
}
