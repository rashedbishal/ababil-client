<?php

namespace App\Support;

use App\Models\Product;
use App\Models\Setting;

/**
 * Builds the search/social metadata for the storefront page. It's rendered
 * server-side by the root Blade view (not by React), because search and
 * social crawlers read the raw HTML - most never run the page's JavaScript.
 *
 * Title and description come from the product's admin-editable meta fields;
 * the site name Google shows above the result comes from the "Website name"
 * setting. Each falls back to a sensible default when left blank.
 */
class StorefrontSeo
{
    public const DEFAULT_SITE_NAME = 'Ababil Official';

    public const DEFAULT_TITLE = 'Ababil Organic Pain Relief Oil – আবাবিল অর্গানিক পেইন রিলিফ অয়েল';

    public const DEFAULT_DESCRIPTION = 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল – হাঁটু, ঘাড়, পিঠ ও কোমরের ব্যথায় দ্রুত আরামের প্রাকৃতিক সমাধান। ক্যাশ অন ডেলিভারিতে সারা বাংলাদেশে হোম ডেলিভারি।';

    /**
     * @return array{title: string, description: string, siteName: string, url: string, image: string, jsonLd: list<array<string, mixed>>}
     */
    public static function build(?Product $product, bool $inStock): array
    {
        $siteName = self::filled(Setting::get('site_name')) ?? self::DEFAULT_SITE_NAME;
        $title = self::filled($product?->meta_title) ?? self::DEFAULT_TITLE;
        $description = self::filled($product?->meta_description) ?? self::DEFAULT_DESCRIPTION;
        // Built from APP_URL rather than the request, so every host/scheme
        // the site answers on (http/https, with/without www) points search
        // engines at one canonical address.
        $baseUrl = rtrim((string) config('app.url'), '/');
        $url = $baseUrl.'/';
        $image = $baseUrl.'/images/og-image.jpg';
        $facebookUrl = self::filled(Setting::get('facebook_page_url'));

        $jsonLd = [
            [
                '@context' => 'https://schema.org',
                '@type' => 'WebSite',
                'name' => $siteName,
                'alternateName' => array_values(array_diff([self::DEFAULT_SITE_NAME, 'Ababil', 'আবাবিল'], [$siteName])),
                'url' => $url,
            ],
            [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => $siteName,
                'url' => $url,
                'logo' => $baseUrl.'/images/logo.png',
                'email' => self::filled(Setting::get('site_email')),
                'telephone' => self::filled(Setting::get('site_phone')),
                'sameAs' => $facebookUrl !== null ? [$facebookUrl] : [],
            ],
        ];

        if ($product !== null) {
            $jsonLd[] = [
                '@context' => 'https://schema.org',
                '@type' => 'Product',
                'name' => $product->name,
                'description' => $description,
                'sku' => $product->sku,
                'image' => [$image],
                'brand' => ['@type' => 'Brand', 'name' => 'Ababil'],
                'offers' => [
                    '@type' => 'Offer',
                    'url' => $url,
                    'price' => $product->currentPrice(),
                    'priceCurrency' => self::filled(Setting::get('currency')) ?? 'BDT',
                    'availability' => $inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                ],
            ];
        }

        return [
            'title' => $title,
            'description' => $description,
            'siteName' => $siteName,
            'url' => $url,
            'image' => $image,
            'jsonLd' => array_values(array_map(fn (array $node) => array_filter($node, fn ($value) => $value !== null), $jsonLd)),
        ];
    }

    private static function filled(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}
