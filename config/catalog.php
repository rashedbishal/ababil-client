<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Product Creation Lock
    |--------------------------------------------------------------------------
    |
    | This storefront is intentionally a single-product landing page. While
    | true, admins can add new products (the "Add product" button and the
    | create/store routes are enabled). Once the catalog is finalized, set
    | this to false to lock the catalog down to its existing product(s) -
    | the button disappears and the create/store routes 403.
    |
    */

    'product_lock' => (bool) env('PRODUCT_LOCK', false),

];
