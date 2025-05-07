<?php

namespace App\Observers;

use App\Models\AccessLevel;
use Illuminate\Support\Facades\Cache;

class AccessLevelObserver
{
    /**
     * Handle the AccessLevel "created" event.
     */
    public function created(AccessLevel $accessLevel): void
    {
        Cache::forget('access_levels_cache');
    }

    /**
     * Handle the AccessLevel "updated" event.
     */
    public function updated(AccessLevel $accessLevel): void
    {
        Cache::forget('access_levels_cache');
    }

    /**
     * Handle the AccessLevel "deleted" event.
     */
    public function deleted(AccessLevel $accessLevel): void
    {
        //
    }

    /**
     * Handle the AccessLevel "restored" event.
     */
    public function restored(AccessLevel $accessLevel): void
    {
        //
    }

    /**
     * Handle the AccessLevel "force deleted" event.
     */
    public function forceDeleted(AccessLevel $accessLevel): void
    {
        //
    }
}
