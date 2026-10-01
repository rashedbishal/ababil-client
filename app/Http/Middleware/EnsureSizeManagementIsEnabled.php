<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSizeManagementIsEnabled
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('catalog.size_set')) {
            abort(403, 'Size/variant management is disabled. Enable SIZE_SET to use it.');
        }

        return $next($request);
    }
}
