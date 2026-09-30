<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Courier Provider
    |--------------------------------------------------------------------------
    |
    | Name of the provider config below to bind CourierServiceInterface to.
    | Leave as "null" until a real provider implementation is added - the
    | app will keep working, courier actions will just be unavailable.
    |
    */

    'default' => env('COURIER_DEFAULT', 'null'),

    /*
    |--------------------------------------------------------------------------
    | Provider Configuration
    |--------------------------------------------------------------------------
    |
    | Credentials are read from the environment only - never hard-code them
    | and never expose them to the frontend. Each provider block is a
    | placeholder for when a real integration is built against that
    | provider's actual API documentation.
    |
    */

    'providers' => [

        'pathao' => [
            'base_url' => env('PATHAO_BASE_URL'),
            'client_id' => env('PATHAO_CLIENT_ID'),
            'client_secret' => env('PATHAO_CLIENT_SECRET'),
            'username' => env('PATHAO_USERNAME'),
            'password' => env('PATHAO_PASSWORD'),
            'store_id' => env('PATHAO_STORE_ID'),
        ],

        'steadfast' => [
            'base_url' => env('STEADFAST_BASE_URL'),
            'api_key' => env('STEADFAST_API_KEY'),
            'secret_key' => env('STEADFAST_SECRET_KEY'),
        ],

        'redx' => [
            'base_url' => env('REDX_BASE_URL'),
            'api_token' => env('REDX_API_TOKEN'),
        ],

    ],

];
