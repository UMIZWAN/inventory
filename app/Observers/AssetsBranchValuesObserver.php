<?php

namespace App\Observers;

use App\Models\AssetsBranchValues;
use Illuminate\Support\Facades\Cache;

class AssetsBranchValuesObserver
{
    /**
     * Handle the AssetsBranchValues "created" event.
     */
    public function created(AssetsBranchValues $assetsBranchValues): void
    {
        Cache::forget('assets_cache');
    }

    /**
     * Handle the AssetsBranchValues "updated" event.
     */
    public function updated(AssetsBranchValues $assetsBranchValues): void
    {
        Cache::forget('assets_cache');
    }
    
    public function deleted(AssetsBranchValues $assetsBranchValues): void
    {
        Cache::forget('assets_cache');
    }
}
