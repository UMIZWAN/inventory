<?php

namespace Database\Seeders;

use App\Models\AccessLevel;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
// use Database\Seeders\AssetCategorySeeder;
use Database\Seeders\AssetsSeeder;
use Database\Seeders\AccessLevelSeeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\SuppliersSeeder;
use Database\Seeders\TaxSeeder;
use Database\Seeders\PurchaseOrderSeeder;
use Database\Seeders\AssetsTransactionSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AccessLevelSeeder::class,
            UserSeeder::class,
            AssetsSeeder::class,
            SuppliersSeeder::class,
            TaxSeeder::class,
            PurchaseOrderSeeder::class,
            AssetsTransactionSeeder::class,
        ]);
    }
}
