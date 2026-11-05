<?php

namespace App\Actions\Products;

use App\Models\Product;
use App\Models\ProductImage;

/**
 * One-time import of the four product photos that used to be hard-coded into
 * the storefront (resources/images/landing/product) onto the featured
 * product, so the live page looks the same right after the CMS goes live.
 * Does nothing if there is no product yet or it already has any images, and
 * skips any source file that's missing, so it's safe to run more than once.
 */
class ImportBundledProductImagesAction
{
    private const FILES = ['product-1', 'product-2', 'product-3', 'product-4'];

    /**
     * @return int how many images were created
     */
    public function execute(?string $sourceDirectory = null): int
    {
        $product = Product::query()->where('is_active', true)->orderBy('sort_order')->first();

        if ($product === null || $product->images()->exists()) {
            return 0;
        }

        $sourceDirectory ??= resource_path('images/landing/product');
        $store = app(StoreProductImageAction::class);
        $created = 0;

        foreach (self::FILES as $file) {
            $source = "{$sourceDirectory}/{$file}.webp";

            if (! is_file($source)) {
                continue;
            }

            $media = $store->store((string) file_get_contents($source), "{$file}.webp");

            ProductImage::query()->create([
                'product_id' => $product->id,
                'media_id' => $media->id,
                'sort_order' => $created,
            ]);
            $created++;
        }

        return $created;
    }
}
