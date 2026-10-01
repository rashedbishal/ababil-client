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

    /*
    |--------------------------------------------------------------------------
    | Size/Variant Management
    |--------------------------------------------------------------------------
    |
    | The current catalog has no products that need per-size variants. While
    | false, the Sizes admin page, the size/variant section on the product
    | edit page, and their underlying routes are all hidden/locked down.
    | Set to true only if a product that actually needs sizes is added.
    |
    */

    'size_set' => (bool) env('SIZE_SET', false),

];
