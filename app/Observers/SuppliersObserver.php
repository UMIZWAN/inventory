<?php

namespace App\Observers;

use App\Models\Suppliers;
use Illuminate\Support\Facades\Cache;

class SuppliersObserver
{
    /**
     * Handle the Suppliers "created" event.
     */
    public function created(Suppliers $suppliers): void
    {
        Cache::forget('suppliers_cache');
    }
}
