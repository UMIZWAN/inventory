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

    public function updated(Suppliers $suppliers): void
    {
        Cache::forget('suppliers_cache');
        Cache::forget('users_cache');
    }

    public function deleted(Suppliers $suppliers): void
    {
        Cache::forget('suppliers_cache');
    }
}
