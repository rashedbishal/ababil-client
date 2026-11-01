@php
    // Analytics/ad-pixel scripts belong only on the pages a customer
    // actually sees (the storefront and its order-confirmation link) -
    // never on admin/auth pages, which this same root view also renders.
    $isStorefrontPage = in_array($page['component'], ['welcome', 'concept-3', 'order-confirmation'], true);
    // The concept-3 hero banner (first slide) is this page's LCP element,
    // but it's only rendered by React after hydration - with no SSR, the
    // browser can't paint it until the JS bundle has downloaded, parsed,
    // executed and mounted. A static copy of that same slide is rendered
    // straight into the body below (mirroring Concept3Banner's own
    // <picture> markup/breakpoints exactly) so it paints immediately from
    // HTML alone; Concept3Banner removes it once its own real image is
    // loaded (see #lcp-placeholder below and concept3-banner.tsx).
    $isConcept3Page = $page['component'] === 'concept-3';
    // Concept3Banner (and therefore the LCP element it's standing in for)
    // never mounts when there's no product - LandingController already
    // resolved that for this exact request, so it's checked here from the
    // same page props Inertia itself is about to render, rather than
    // guessing or giving the placeholder a fixed lifetime.
    $showLcpPlaceholder = $isConcept3Page && ($page['props']['product'] ?? null) !== null;
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

        @if ($showLcpPlaceholder)
            {{-- Hand-written, not Tailwind-derived: #lcp-placeholder (below,
                 in <body>) must be able to paint in its correct position
                 and size before the external app.css stylesheet has
                 loaded - see the non-blocking stylesheet swap further down
                 for why that stylesheet can no longer be relied on for
                 this element's first paint. ID selectors (not the classes
                 already on the markup) so this always wins regardless of
                 load order once app.css's own (identical) utility rules
                 do arrive, instead of racing the cascade. --}}
            <style>
                #lcp-placeholder {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 64px; /* SiteHeader's own `h-16` height, unscrolled */
                    z-index: 40;
                    pointer-events: none;
                }

                #lcp-placeholder > div {
                    position: relative;
                    margin-left: auto;
                    margin-right: auto;
                    width: 100%;
                    max-width: 1920px;
                    overflow: hidden;
                    aspect-ratio: 4 / 3;
                }

                @media (min-width: 640px) {
                    #lcp-placeholder > div {
                        aspect-ratio: 16 / 9;
                    }
                }

                @media (min-width: 1024px) {
                    #lcp-placeholder > div {
                        aspect-ratio: 2560 / 800;
                    }
                }

                #lcp-placeholder img {
                    display: block;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                }
            </style>

            {{-- Responsive preload for this page's LCP image, matching the
                 #lcp-placeholder <picture>'s own breakpoints exactly (639px/
                 1023px thresholds) so the browser fetches exactly one of
                 the three variants - never more than one - before it even
                 reaches <body>. Plain static /images/hero/ paths (not
                 Vite-processed), so these are literal, stable URLs -
                 identical to the ones #lcp-placeholder and
                 Concept3Banner's own slide 1 already use. --}}
            <link rel="preload" as="image" fetchpriority="high"
                  media="(max-width: 639px)"
                  href="/images/hero/001_mobile.webp">
            <link rel="preload" as="image" fetchpriority="high"
                  media="(min-width: 640px) and (max-width: 1023px)"
                  href="/images/hero/001_tab.webp">
            <link rel="preload" as="image" fetchpriority="high"
                  media="(min-width: 1024px)"
                  href="/images/hero/IMG_3616_desktop.webp">
        @endif

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
        @if ($showLcpPlaceholder)
            {{-- Scoped to concept-3 *with* a product only - not
                 welcome/order-confirmation (also "storefront" pages) or
                 concept-3's own no-product fallback, none of which have
                 inline critical CSS of their own below, so making their
                 stylesheet non-blocking would risk a flash of unstyled
                 content this change isn't meant to touch. --}}
            @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
            {{-- The storefront's hero placeholder above needs to paint
                 before this loads, so it can't be a normal (render-
                 blocking) stylesheet link here the way admin/auth pages
                 still get below - `media="print"` means the browser
                 fetches it at normal priority without blocking first
                 paint on it (print rarely matches, so it's inert until
                 swapped), and `onload` flips it to `all` once it's ready,
                 applying every other style on the page exactly as before.
                 `Vite::asset()` resolves to the same URL `@vite()` itself
                 would have used - the Vite dev server's URL when running
                 hot, the hashed build path otherwise - so this still goes
                 through Laravel's Vite integration, not around it. --}}
            <link rel="stylesheet" href="{{ \Illuminate\Support\Facades\Vite::asset('resources/css/app.css') }}" media="print" onload="this.media='all'">
            {{-- Only reached with JavaScript disabled (`onload` above
                 can't run), where this is the only chance app.css ever
                 gets applied - a second, ordinary blocking link, so the
                 page isn't left unstyled rather than merely slower. --}}
            <noscript>
                <link rel="stylesheet" href="{{ \Illuminate\Support\Facades\Vite::asset('resources/css/app.css') }}">
            </noscript>
        @else
            @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @endif
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

        @if ($showLcpPlaceholder)
            {{-- Static copy of Concept3Banner's first slide (its own
                 <picture>/<img>, same URLs/breakpoints) so the LCP element
                 paints from HTML alone, before React/Inertia ever runs.
                 `top-16` matches SiteHeader's own `h-16` height in its
                 initial (docked, unscrolled) state, so this sits exactly
                 where the real banner will land once React mounts -
                 `absolute` (not `fixed`) so it takes no layout space of
                 its own and scrolls with the page like normal content,
                 and `pointer-events-none` keeps it from ever intercepting
                 clicks meant for the real banner underneath. Removed by
                 concept3-banner.tsx once its own matching image has
                 actually loaded - never by this page alone. --}}
            <div id="lcp-placeholder" class="pointer-events-none absolute inset-x-0 top-16 z-40">
                <div class="relative mx-auto aspect-[4/3] w-full max-w-[1920px] overflow-hidden sm:aspect-[16/9] lg:aspect-[2560/800]">
                    <picture>
                        <source media="(max-width: 639px)" srcset="/images/hero/001_mobile.webp">
                        <source media="(max-width: 1023px)" srcset="/images/hero/001_tab.webp">
                        <img src="/images/hero/IMG_3616_desktop.webp" alt="বয়স বাড়লেও গতি রবে — আবাবিল অয়েল" loading="eager" fetchpriority="high" class="size-full object-cover">
                    </picture>
                </div>
            </div>
        @endif

        <x-inertia::app />
    </body>
</html>
