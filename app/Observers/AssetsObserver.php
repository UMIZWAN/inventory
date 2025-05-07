<?php

namespace App\Observers;

use App\Models\Assets;
use Illuminate\Support\Facades\Cache;

class AssetsObserver
{
    /**
     * Handle the Assets "created" event.
     */
    public function created(Assets $assets): void
    {
        Cache::forget('assets_cache');
    }

    public function updated(Assets $assets): void
    {
        Cache::forget('assets_cache');
    }

    public function deleted(Assets $assets): void
    {
        Cache::forget('assets_cache');
    }
}
