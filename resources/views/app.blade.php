@php
    // Analytics/ad-pixel scripts belong only on the pages a customer
    // actually sees (the storefront and its order-confirmation link) -
    // never on admin/auth pages, which this same root view also renders.
    $isStorefrontPage = in_array($page['component'], ['welcome', 'concept-3', 'order-confirmation'], true);
    // Raw, admin-pasted tracking snippets (GTM/Pixel/GA/etc. install code) - not generated here.
    // Trusted because only admins can write these settings; injected verbatim like any site owner
    // pasting a vendor's install snippet into their template.
    $headCode = $isStorefrontPage ? \App\Models\Setting::get('head_code') : null;
    $bodyCode = $isStorefrontPage ? \App\Models\Setting::get('body_code') : null;
@endphp
<!DOCTYPE html>
<html lang="{{ isset($seo) ? 'bn' : str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        {{-- Square PNGs in multiples of 48px are what Google Search uses for the result favicon --}}
        <link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48">
        <link rel="icon" href="/favicon-192x192.png" type="image/png" sizes="192x192">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @isset($seo)
            {{-- Storefront search/social metadata (App\Support\StorefrontSeo) --}}
            <meta name="description" content="{{ $seo['description'] }}">
            <link rel="canonical" href="{{ $seo['url'] }}">
            <meta property="og:type" content="website">
            <meta property="og:site_name" content="{{ $seo['siteName'] }}">
            <meta property="og:title" content="{{ $seo['title'] }}">
            <meta property="og:description" content="{{ $seo['description'] }}">
            <meta property="og:url" content="{{ $seo['url'] }}">
            <meta property="og:image" content="{{ $seo['image'] }}">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
            <meta property="og:locale" content="bn_BD">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="{{ $seo['title'] }}">
            <meta name="twitter:description" content="{{ $seo['description'] }}">
            <meta name="twitter:image" content="{{ $seo['image'] }}">
            <script type="application/ld+json">{!! json_encode($seo['jsonLd'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG) !!}</script>
        @else
            {{-- Only the storefront belongs in search results - not order confirmations, login or admin pages --}}
            <meta name="robots" content="noindex, nofollow">
        @endisset

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        {{-- The storefront title lives outside <x-inertia::head> so it's present
             whether or not SSR replaces that block's contents. --}}
        @isset($seo)
            <title>{{ $seo['title'] }}</title>
        @endisset
        <x-inertia::head>
            @unless (isset($seo))
                <title>{{ config('app.name', 'Laravel') }}</title>
            @endunless
        </x-inertia::head>

        @if ($headCode)
            {{-- Admin-pasted head code (Settings → Head code injection) --}}
            {!! $headCode !!}
        @endif
    </head>
    <body class="font-sans antialiased">
        @if ($bodyCode)
            {{-- Admin-pasted body code (Settings → Body code injection) --}}
            {!! $bodyCode !!}
        @endif

        <x-inertia::app />
    </body>
</html>
