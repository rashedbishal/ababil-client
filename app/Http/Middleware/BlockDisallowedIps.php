<?php

namespace App\Http\Middleware;

use App\Models\BlockedIp;
use App\Support\IpAddress;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks customer-facing order actions from a blocked IP address.
 *
 * This must only be attached to customer/order routes, never to admin
 * routes, so a blocked customer can never accidentally lock out an admin.
 */
class BlockDisallowedIps
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = IpAddress::normalize((string) $request->ip());

        $isBlocked = BlockedIp::query()
            ->where('ip_address', $ip)
            ->where('is_active', true)
            ->get()
            ->contains(fn (BlockedIp $blockedIp): bool => $blockedIp->isCurrentlyBlocking());

        if ($isBlocked) {
            // An Inertia request needs an Inertia-aware response. A bare
            // abort(403) returns plain HTML, which Inertia's client can't
            // treat as a page visit - it falls back to its own built-in
            // error dialog (an iframe inside a native <dialog>), whose
            // links can't escape that iframe's sandbox, leaving the
            // shopper stuck looking at a dead "back to homepage" button.
            // Redirecting back with a validation-style error instead keeps
            // the response inside Inertia's normal flow and surfaces
            // through the checkout page's existing error handling (see
            // welcome.tsx's onError -> errors.order), the same path
            // PlaceOrderRequest's bot checks and OrderController's stock
            // conflicts already use.
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'order' => "We couldn't process your order. Please refresh the page and try again.",
                ])->withInput();
            }

            abort(403, 'Your access has been restricted.');
        }

        return $next($request);
    }
}
