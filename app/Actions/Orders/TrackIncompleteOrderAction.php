<?php

namespace App\Actions\Orders;

use App\Enums\IncompleteOrderConversionStatus;
use App\Models\IncompleteOrder;
use Illuminate\Support\Str;

/**
 * Upserts a single incomplete-order row per checkout session.
 *
 * The frontend debounces calls into this (see the checkout form), so this
 * is called at most a few times per session rather than on every keystroke.
 * Once an order converts, PlaceOrderAction marks the row converted and this
 * stops being called for that session - but the session token itself is a
 * client-persisted (localStorage) value the frontend also reuses across
 * page loads, so it's the one piece of data this action can't fully trust:
 * if the frontend didn't rotate it after a successful order (an old build,
 * or JS that never ran), replaying it here would silently upsert onto the
 * row that's already converted - invisible in the admin list - instead of
 * tracking the new attempt. Returning the token actually used lets the
 * frontend pick up a rotation it missed, in addition to the explicit
 * rotation it already does right after a successful order.
 */
class TrackIncompleteOrderAction
{
    /**
     * @param  array<string, mixed>  $data
     * @return string the session token actually used - the one passed in,
     *                unless it already belonged to a converted row, in
     *                which case a fresh one.
     */
    public function execute(string $sessionToken, array $data, ?string $ip, ?string $userAgent): string
    {
        // Someone who's only browsed/started typing a name or address isn't
        // a real abandoned-checkout signal yet - a phone number is the
        // first sign they got far enough to actually be worth following up
        // on, so don't count (or create) a row until one's been given.
        if (blank($data['customer_phone'] ?? null)) {
            return $sessionToken;
        }

        $existing = IncompleteOrder::query()->where('session_token', $sessionToken)->first();

        if ($existing?->conversion_status === IncompleteOrderConversionStatus::Converted) {
            $sessionToken = (string) Str::uuid();
        }

        // updateOrCreate()'s create path goes through firstOrCreate() /
        // createOrFirst(), which catches a UniqueConstraintViolationException
        // on the session_token unique index and re-fetches instead of
        // throwing - so two near-simultaneous requests for the same checkout
        // session can't raise a raw 500 here.
        IncompleteOrder::query()->updateOrCreate(
            ['session_token' => $sessionToken],
            [
                ...$data,
                'customer_ip' => $ip,
                'user_agent' => $userAgent,
                'last_activity_at' => now(),
            ],
        );

        return $sessionToken;
    }
}
