<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProductCreationIsUnlocked
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('catalog.product_lock')) {
            abort(403, 'Adding new products is disabled. Enable PRODUCT_LOCK to add more.');
        }

        return $next($request);
    }
}
