<?php

namespace App\Observers;

use App\Models\ShippingOption;
use Illuminate\Support\Facades\Cache;

class ShippingOptionObserver
{
    /**
     * Handle the ShippingOption "created" event.
     */
    public function created(ShippingOption $shippingOption): void
    {
        Cache::forget('shipping_option_cache');
    }

    /**
     * Handle the ShippingOption "updated" event.
     */
    public function updated(ShippingOption $shippingOption): void
    {
        Cache::forget('shipping_option_cache');
    }
}
