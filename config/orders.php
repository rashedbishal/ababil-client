<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Checkout Spam / Bot Guards
    |--------------------------------------------------------------------------
    |
    | The storefront has no login, so these are the only gate between a
    | public form and a created order. Tunable without a code change.
    |
    */

    // A submission arriving faster than this many seconds after the landing
    // page rendered is treated as automated and rejected.
    'min_seconds_before_submit' => (int) env('ORDER_MIN_SECONDS_BEFORE_SUBMIT', 3),

    // A checkout form token older than this is stale/likely replayed and
    // rejected, even though it's otherwise time-valid.
    'max_form_token_age_hours' => (int) env('ORDER_MAX_FORM_TOKEN_AGE_HOURS', 6),

    // Maximum orders a single phone number may place in a rolling 24 hours.
    'max_orders_per_phone_per_day' => (int) env('ORDER_MAX_PER_PHONE_PER_DAY', 5),

    // A second order from the same phone for the same product within this
    // many minutes is flagged for admin review rather than blocked outright.
    'duplicate_order_window_minutes' => (int) env('ORDER_DUPLICATE_WINDOW_MINUTES', 15),

];
