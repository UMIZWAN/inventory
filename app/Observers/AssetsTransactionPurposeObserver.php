<?php

namespace App\Observers;

use App\Models\AssetsTransactionPurpose;
use Illuminate\Support\Facades\Cache;

class AssetsTransactionPurposeObserver
{
    /**
     * Handle the AssetsTransactionPurpose "created" event.
     */
    public function created(AssetsTransactionPurpose $assetsTransactionPurpose): void
    {
        Cache::forget('assets_transaction_purpose_cache');
    }

    /**
     * Handle the AssetsTransactionPurpose "updated" event.
     */
    public function updated(AssetsTransactionPurpose $assetsTransactionPurpose): void
    {
        Cache::forget('assets_transaction_purpose_cache');
    }
}
