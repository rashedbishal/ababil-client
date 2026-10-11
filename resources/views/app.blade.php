@php
    // Analytics/ad-pixel scripts belong only on the pages a customer
    // actually sees (the storefront and its order-confirmation link) -
    // never on admin/auth pages, which this same root view also renders.
    $isStorefrontPage = in_array($page['component'], ['welcome', 'concept-3', 'order-confirmation'], true);
    $gtmId = $isStorefrontPage ? \App\Models\Setting::get('google_tag_manager_id') : null;
    $pixelId = $isStorefrontPage ? \App\Models\Setting::get('facebook_pixel_id') : null;
    $gaId = $isStorefrontPage ? \App\Models\Setting::get('google_analytics_id') : null;
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

        @if ($gtmId)
            {{-- Google Tag Manager --}}
            <script>
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',{!! \Illuminate\Support\Js::from($gtmId) !!});
            </script>
        @endif

        @if ($pixelId)
            {{-- Meta (Facebook) Pixel --}}
            <script>
                !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', {!! \Illuminate\Support\Js::from($pixelId) !!});
                fbq('track', 'PageView');
            </script>
        @endif

        @if ($gaId)
            {{-- Google Analytics --}}
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $gaId }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', {!! \Illuminate\Support\Js::from($gaId) !!});
            </script>
        @endif
    </head>
    <body class="font-sans antialiased">
        @if ($gtmId)
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtmId }}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif

        @if ($pixelId)
            <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id={{ $pixelId }}&ev=PageView&noscript=1" /></noscript>
        @endif

        <x-inertia::app />
    </body>
</html>
