<?php

namespace App\Providers;

use App\Models\Assets;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use App\Observers\AssetsObserver;
use App\Models\AssetsBranch;
use App\Observers\AssetsBranchObserver;
use App\Models\AssetsCategory;
use App\Observers\AssetsCategoryObserver;
use App\Models\User;
use App\Observers\UserObserver;
use App\Models\AssetsBranchValues;
use App\Observers\AssetsBranchValuesObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);
        Assets::observe(AssetsObserver::class);
        AssetsBranch::observe(AssetsBranchObserver::class);
        AssetsCategory::observe(AssetsCategoryObserver::class);
        User::observe(UserObserver::class);
        AssetsBranchValues::observe(AssetsBranchValuesObserver::class);
    }
}
