<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Facebook's in-app browser (and other webviews) can bfcache-restore these
 * pages across backgrounding without a fresh request, carrying a stale CSRF
 * token/session pairing into the checkout form's next submit and causing a
 * 419. These headers stop the browser from serving a cached/bfcache copy of
 * the page at all, so reopening the tab always re-fetches it with a current
 * token.
 */
class PreventStorefrontCaching
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('Cache-Control', 'no-store, must-revalidate');
        $response->headers->set('Pragma', 'no-cache');

        return $response;
    }
}
