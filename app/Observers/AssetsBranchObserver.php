<?php

namespace App\Observers;

use App\Models\AssetsBranch;
use Illuminate\Support\Facades\Cache;

class AssetsBranchObserver
{
    /**
     * Handle the AssetsBranch "created" event.
     */
    public function created(AssetsBranch $assetsBranch): void
    {
        Cache::forget('assets_branch_cache');
    }

    public function updated(AssetsBranch $assetsBranch): void
    {
        Cache::forget('assets_branch_cache');
    }

    public function deleted(AssetsBranch $assetsBranch): void
    {
        Cache::forget('assets_branch_cache');
    }
}
