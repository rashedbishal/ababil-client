<?php

namespace App\Http\Controllers;

use App\Enums\GallerySection;
use App\Models\Certificate;
use App\Models\GalleryItem;
use App\Models\Order;
use App\Models\PartnerLogo;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Setting;
use App\Models\ShippingArea;
use App\Support\OrderPayload;
use App\Support\StorefrontSeo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Show the customer landing/checkout page.
     *
     * Renders the `concept-3` design (see `resources/js/pages/concept-3.tsx`)
     * - this was a design-trial page until it was finalized as the live
     * storefront, replacing `welcome.tsx` (see `legacyWelcome()`).
     *
     * Only one product is featured for now, but the schema behind it
     * supports many products.
     */
    public function show(Request $request): Response
    {
        $product = $this->featuredProduct();

        return Inertia::render('concept-3', [
            ...$this->sharedProps($product),
            'productImages' => $this->productImages($product),
            'gallery' => $this->gallery(),
            'partners' => $this->partners(),
            'certificates' => $this->certificates(),
            'orderPlaced' => $this->orderPlaced($request),
            'orderError' => $request->query('order_error'),
        ])->withViewData('seo', $this->seo($product));
    }

    /**
     * `OrderController::store()` redirects here with `?placed=<order_number>`
     * on success rather than flashing the order to the session - the
     * storefront's own result modal needs this data to survive the
     * redirect's follow-up GET, and session-based flash can't be trusted to
     * do that in every browser (some in-app webviews don't reliably persist
     * the session cookie across requests). The order number is no more
     * sensitive here than it already is on the public, unauthenticated
     * `orders/{orderNumber}/confirmation` route.
     *
     * @return array<string, mixed>|null
     */
    private function orderPlaced(Request $request): ?array
    {
        $orderNumber = $request->query('placed');

        if (! is_string($orderNumber) || $orderNumber === '') {
            return null;
        }

        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->first();

        return $order ? OrderPayload::build($order) : null;
    }

    /**
     * The previous live storefront design, kept for reference only - no
     * route points here anymore (see `show()`), but the page and its
     * components (`resources/js/pages/welcome.tsx`) are left in place in
     * case this design needs to be viewed or restored later.
     */
    public function legacyWelcome(): Response
    {
        $product = $this->featuredProduct();

        return Inertia::render('welcome', $this->sharedProps($product))
            ->withViewData('seo', $this->seo($product));
    }

    /**
     * The product's photos in carousel order. Empty when none are uploaded,
     * which the storefront treats as "no carousel".
     *
     * @return array<int, array{id: int, src: string, alt: string}>
     */
    private function productImages(?Product $product): array
    {
        if ($product === null) {
            return [];
        }

        return $product->images()
            ->with('media')
            ->get()
            ->map(fn (ProductImage $image, int $index) => [
                'id' => $image->id,
                'src' => $image->imageUrl(),
                'alt' => $product->name.' - ছবি '.($index + 1),
            ])
            ->values()
            ->all();
    }

    /**
     * The shown photos of each gallery section, keyed by section. A section
     * with no shown photos comes back as an empty list, which the storefront
     * treats as "don't render this section".
     *
     * @return array<string, array<int, array{id: int, image: string, alt: string, caption: string}>>
     */
    private function gallery(): array
    {
        $items = GalleryItem::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy(fn (GalleryItem $item) => $item->section->value);

        $gallery = [];

        foreach (GallerySection::cases() as $section) {
            $gallery[$section->value] = $items->get($section->value, collect())
                ->map(fn (GalleryItem $item) => [
                    'id' => $item->id,
                    'image' => $item->imageUrl(),
                    'alt' => $item->alt ?? $item->caption,
                    'caption' => $item->caption,
                ])
                ->values()
                ->all();
        }

        return $gallery;
    }

    /**
     * The shown partner/certification logos, in order. An empty list means
     * the storefront leaves the whole strip out.
     *
     * @return array<int, array{id: int, image: string, label: string}>
     */
    private function partners(): array
    {
        return PartnerLogo::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (PartnerLogo $item) => [
                'id' => $item->id,
                'image' => $item->imageUrl(),
                'label' => $item->label,
            ])
            ->values()
            ->all();
    }

    /**
     * The shown storefront certificates, in order. An empty list means the
     * section is omitted entirely.
     *
     * @return array<int, array{id: int, title: string, subtitle: string|null, image: string}>
     */
    private function certificates(): array
    {
        return Certificate::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (Certificate $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'subtitle' => $item->subtitle,
                'image' => $item->imageUrl(),
            ])
            ->values()
            ->all();
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
            'reviews' => Review::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'video_path', 'thumbnail_path', 'video_id'])
                ->map(fn (Review $review) => [
                    'id' => $review->id,
                    'video_url' => $review->videoUrl(),
                    'thumbnail_url' => $review->thumbnailUrl(),
                    'video_id' => $review->video_id,
                ])
                ->values()
                ->all(),
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
