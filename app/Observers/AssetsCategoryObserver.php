<?php

namespace App\Observers;

use App\Models\AssetsCategory;
use Illuminate\Support\Facades\Cache;

class AssetsCategoryObserver
{
    /**
     * Handle the AssetsCategory "created" event.
     */
    public function created(AssetsCategory $assetsCategory): void
    {
        Cache::forget('assets_category_cache');
    }

    public function updated(AssetsCategory $assetsCategory): void
    {
        Cache::forget('assets_category_cache');
    }

    public function deleted(AssetsCategory $assetsCategory): void
    {
        Cache::forget('assets_category_cache');
    }
}
