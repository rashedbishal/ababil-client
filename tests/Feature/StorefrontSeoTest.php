<?php

use App\Models\Product;
use App\Models\Setting;
use App\Support\StorefrontSeo;

test('the storefront renders server-side seo tags with defaults', function () {
    Product::factory()->create(['is_active' => true, 'meta_title' => null, 'meta_description' => null, 'short_description' => null]);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('<title>'.e(StorefrontSeo::DEFAULT_TITLE).'</title>', false);
    $response->assertSee('<meta name="description" content="'.e(StorefrontSeo::DEFAULT_DESCRIPTION).'">', false);
    $response->assertSee('<link rel="canonical" href="'.rtrim(config('app.url'), '/').'/">', false);
    $response->assertSee('"@type":"WebSite"', false);
    $response->assertSee('"@type":"Product"', false);
    $response->assertDontSee('noindex');
});

test('the storefront seo uses the product meta fields and site name setting', function () {
    Product::factory()->create([
        'is_active' => true,
        'meta_title' => 'Custom SEO Title',
        'meta_description' => 'Custom SEO description.',
    ]);
    Setting::set('site_name', 'Ababil Official');

    $response = $this->get(route('home'));

    $response->assertSee('<title>Custom SEO Title</title>', false);
    $response->assertSee('<meta name="description" content="Custom SEO description.">', false);
    $response->assertSee('<meta property="og:site_name" content="Ababil Official">', false);
    $response->assertSee('"@type":"WebSite","name":"Ababil Official"', false);
});

test('the storefront still renders seo tags without a product', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('<title>'.e(StorefrontSeo::DEFAULT_TITLE).'</title>', false);
    $response->assertDontSee('"@type":"Product"', false);
});

test('non-storefront pages are kept out of search results', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
    $response->assertSee('<meta name="robots" content="noindex, nofollow">', false);
    $response->assertDontSee('application/ld+json', false);
});
