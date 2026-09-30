<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Provider Field Definitions
    |--------------------------------------------------------------------------
    |
    | This only describes the *shape* of each provider's credentials for the
    | admin Courier Integration page - actual values live in the database
    | (courier_providers table, encrypted at rest), set from that page.
    | 'secret' fields are never sent back to the browser once saved; the
    | form shows a blank input and only overwrites the stored value when the
    | admin actually types something.
    |
    */

    'providers' => [

        'pathao' => [
            'label' => 'Pathao',
            'fields' => [
                'base_url' => ['label' => 'Base URL', 'secret' => false, 'default' => 'https://courier-api-sandbox.pathao.com'],
                'client_id' => ['label' => 'Client ID', 'secret' => true],
                'client_secret' => ['label' => 'Client Secret', 'secret' => true],
                'username' => ['label' => 'Username (email)', 'secret' => true],
                'password' => ['label' => 'Password', 'secret' => true],
                'delivery_type' => ['label' => 'Delivery Type', 'secret' => false, 'default' => '48'],
                'item_type' => ['label' => 'Item Type', 'secret' => false, 'default' => '2'],
            ],
        ],

        'steadfast' => [
            'label' => 'Steadfast',
            'fields' => [
                'base_url' => ['label' => 'Base URL', 'secret' => false],
                'api_key' => ['label' => 'API Key', 'secret' => true],
                'secret_key' => ['label' => 'Secret Key', 'secret' => true],
            ],
        ],

        'redx' => [
            'label' => 'RedX',
            'fields' => [
                'base_url' => ['label' => 'Base URL', 'secret' => false],
                'api_token' => ['label' => 'API Token', 'secret' => true],
            ],
        ],

    ],

];
