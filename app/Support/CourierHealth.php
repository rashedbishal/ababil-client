<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/**
 * Tracks whether the courier API is currently reachable.
 *
 * Set by any courier request that times out / fails to connect, cleared by
 * any request that gets an HTTP response back (even an error one - that
 * still proves the courier is reachable). While set:
 *  - admin pages skip their on-visit courier status refreshes, so they stay
 *    fast instead of each waiting out the request timeout,
 *  - "Submit to courier" is disabled (UI) and rejected (server),
 *  - admins see a one-time alert per login (see HandleInertiaRequests).
 *
 * Recovery is automatic: `courier:check-connection` (scheduled every minute)
 * probes the courier only while this flag is set and clears it as soon as
 * the courier answers. The TTL is a safety net in case the scheduler isn't
 * running - the flag can never outlive it, so a stale "unreachable" can't
 * lock the submit button forever; the next real request re-checks.
 */
class CourierHealth
{
    private const KEY = 'courier:unreachable_since';

    private const TTL_MINUTES = 15;

    public static function markUnreachable(): void
    {
        // Keep the original start time across repeated failures, so the
        // whole outage is reported (and dismissed) as one incident.
        Cache::put(self::KEY, self::since() ?? now()->toIso8601String(), now()->addMinutes(self::TTL_MINUTES));
    }

    public static function markReachable(): void
    {
        Cache::forget(self::KEY);
    }

    public static function isUnreachable(): bool
    {
        return self::since() !== null;
    }

    /**
     * ISO-8601 time the current outage was first detected, or null if the
     * courier is reachable. Doubles as the outage's identity.
     */
    public static function since(): ?string
    {
        $since = Cache::get(self::KEY);

        return is_string($since) ? $since : null;
    }
}
