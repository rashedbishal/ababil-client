<?php

namespace App\Actions\Orders;

use App\Models\IncompleteOrder;

/**
 * Upserts a single incomplete-order row per checkout session.
 *
 * The frontend debounces calls into this (see the checkout form), so this
 * is called at most a few times per session rather than on every keystroke.
 * Once an order converts, PlaceOrderAction marks the row converted and this
 * stops being called for that session.
 */
class TrackIncompleteOrderAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(string $sessionToken, array $data, ?string $ip, ?string $userAgent): IncompleteOrder
    {
        return IncompleteOrder::query()->updateOrCreate(
            ['session_token' => $sessionToken],
            [
                ...$data,
                'customer_ip' => $ip,
                'user_agent' => $userAgent,
                'last_activity_at' => now(),
            ],
        );
    }
}
