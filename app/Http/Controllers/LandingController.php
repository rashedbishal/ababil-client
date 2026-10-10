<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\ShippingArea;
use App\Support\StorefrontSeo;
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
        $product = $this->featuredProduct();

        return Inertia::render('welcome', $this->sharedProps($product))
            ->withViewData('seo', $this->seo($product));
    }

    /**
     * Design-trial page, same data as the live storefront (see AGENTS.md /
     * CLAUDE.md - a frontend-only concept, no business-logic change).
     *
     * Deliberately passes no `$seo` view data (unlike `show()`), so the
     * root Blade view falls back to its default `noindex, nofollow` - these
     * trial pages must never be indexed or treated as a canonical URL.
     */
    public function concept1(): Response
    {
        return Inertia::render('concept-1', $this->sharedProps($this->featuredProduct()));
    }

    /**
     * Design-trial page, same data as the live storefront. See `concept1()`
     * - no `$seo` view data, so it stays `noindex, nofollow`.
     */
    public function concept2(): Response
    {
        return Inertia::render('concept-2', $this->sharedProps($this->featuredProduct()));
    }

    /**
     * Design-trial page, same data as the live storefront. See `concept1()`
     * - no `$seo` view data, so it stays `noindex, nofollow`.
     */
    public function concept3(): Response
    {
        return Inertia::render('concept-3', $this->sharedProps($this->featuredProduct()));
    }

    private function featuredProduct(): ?Product
    {
        return Product::query()
            ->where('is_active', true)
            ->with([
                'variants' => fn ($query) => $query->where('is_active', true)->with('size'),
            ])
            ->orderBy('sort_order')
            ->first();
    }

    /**
     * @return array<string, mixed>
     */
    private function sharedProps(?Product $product): array
    {
        return [
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
            // Signed page-render timestamp. PlaceOrderRequest rejects a
            // checkout submitted implausibly soon after this, since a real
            // shopper needs time to read the page and fill the form - a
            // script submitting instantly doesn't.
            'formToken' => encrypt(now()->timestamp),
        ];
    }

    /**
     * Search metadata must never take the storefront down: if building it
     * from the product fails, report the error and fall back to the
     * site-level tags (no Product structured data) instead of a 500.
     *
     * @return array<string, mixed>
     */
    private function seo(?Product $product): array
    {
        return rescue(
            fn () => StorefrontSeo::build($product, $product !== null && $this->inStock($product)),
            fn () => StorefrontSeo::build(null, false),
        );
    }

    private function inStock(Product $product): bool
    {
        return ! $product->track_stock || $product->stock > 0 || $product->hasVariants();
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
            'free_delivery' => $product->free_delivery,
            'in_stock' => $this->inStock($product),
            'variants' => $product->variants->map(function (ProductVariant $variant) use ($product) {
                // currentPrice() falls back to $variant->product->currentPrice()
                // when there's no price override - set the relation to the
                // $product already loaded here instead of letting it lazy-load
                // (and re-query) the same row once per variant.
                $variant->setRelation('product', $product);

                return [
                    'id' => $variant->id,
                    'size' => $variant->size?->name,
                    'stock' => $variant->stock,
                    'in_stock' => $variant->stock > 0,
                    'price' => $variant->currentPrice(),
                ];
            })->values(),
        ];
    }
}
