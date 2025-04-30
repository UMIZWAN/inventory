<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run AccessLevelSeeder first since UserSeeder depends on it
        $this->call(AccessLevelSeeder::class);
        $this->call(AssetsBranchSeeder::class);
        // Run UserSeeder next to create exactly 10 users
        $this->call(UserSeeder::class);
        
        // Run the rest of your seeders
        $this->call([
            
            AssetsSeeder::class,
            SuppliersSeeder::class,
            TaxSeeder::class,
            PurchaseOrderSeeder::class,
            AssetsTransactionSeeder::class,
        ]);
    }
}
