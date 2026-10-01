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
            abort(403, 'Your access has been restricted.');
        }

        return $next($request);
    }
}
