<?php

use App\Http\Middleware\AddSecurityHeaders;
use App\Http\Middleware\BlockDisallowedIps;
use App\Http\Middleware\EnsureProductCreationIsUnlocked;
use App\Http\Middleware\EnsureSizeManagementIsEnabled;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // _fbp/_fbc are set by Meta's pixel JS in plaintext, not by this app -
        // without this exception, EncryptCookies tries to decrypt them as if
        // Laravel had written them, fails, and silently nulls them out before
        // OrderController::store() ever reads them for the Conversions API
        // call, which is why every server-side Purchase event reached Meta
        // missing fbp/fbc (confirmed via Meta's match-quality diagnostics).
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state', '_fbp', '_fbc']);

        // Unset (the default) trusts no proxy, preserving $request->ip()'s
        // current behavior. Set TRUSTED_PROXIES in production when this app
        // sits behind a reverse proxy/load balancer/CDN - otherwise IP
        // blocking, per-IP rate limiting, and orders.customer_ip all
        // silently resolve to the proxy's address instead of the visitor's.
        // Comma-separated IPs/CIDRs, or '*' to trust the immediate proxy
        // unconditionally (only appropriate when nothing but your own
        // trusted proxy can reach the app directly).
        //
        // env() (not config()) is required here: this closure runs before
        // the config repository is bound - config() throws at this point.
        // That also means Laravel re-reads this from the real environment
        // on every request regardless of config caching, so the usual
        // "env() breaks under config:cache" caveat doesn't apply to this
        // file the way it does inside config/*.php.
        // @phpstan-ignore larastan.noEnvCallsOutsideOfConfig (config() isn't bound yet here, see comment above)
        $trustedProxiesEnv = (string) env('TRUSTED_PROXIES', '');

        $trustedProxies = array_filter(array_map('trim', explode(',', $trustedProxiesEnv)));

        if ($trustedProxies !== []) {
            $middleware->trustProxies(
                at: $trustedProxies === ['*'] ? '*' : $trustedProxies,
                headers: Request::HEADER_X_FORWARDED_FOR
                    | Request::HEADER_X_FORWARDED_HOST
                    | Request::HEADER_X_FORWARDED_PORT
                    | Request::HEADER_X_FORWARDED_PROTO,
            );
        }

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            AddSecurityHeaders::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'blocked-ip' => BlockDisallowedIps::class,
            'product-creation-unlocked' => EnsureProductCreationIsUnlocked::class,
            'size-management-enabled' => EnsureSizeManagementIsEnabled::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
