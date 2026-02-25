<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Inventory SSO Secret
    |--------------------------------------------------------------------------
    |
    | The shared secret key used to authenticate token storage API calls
    | from infonet-super. Must match INVENTORY_SSO_SECRET in infonet-super's .env.
    |
    */
    'sso_secret' => env('INVENTORY_SSO_SECRET', 'inventory-sso-secret-changeme-in-production'),
];
