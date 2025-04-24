<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Assets;
use App\Models\AssetsBranch;
use App\Models\AssetsBranchValues;
use App\Models\AssetsCategory;
use App\Models\AssetsTag;
use App\Models\Suppliers;
use App\Models\PurchaseOrder;
use App\Models\AssetsTransaction;
use App\Models\AssetsTransactionItemList;

class AssetsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        // Create some basic categories
        $categories = ['Electronics', 'Furniture', 'Office Supplies', 'Vehicles', 'Tools'];
        foreach ($categories as $category) {
            AssetsCategory::create(['name' => $category]);
        }

        // Create some basic tags
        $tags = ['High Value', 'Low Value', 'Consumable', 'Depreciated', 'New'];
        foreach ($tags as $tag) {
            AssetsTag::create(['name' => $tag]);
        }

        // Create branches
        $branches = ['UMKK1', 'UMKK2', 'UMTWU', 'UMKGU', 'UMLD'];
        foreach ($branches as $branch) {
            AssetsBranch::create(['name' => $branch]);
        }

        // Create 50 assets
        Assets::factory(50)->create()->each(function ($asset) {
            // For each asset, create between 1 and 3 branch values
            $branchIds = AssetsBranch::inRandomOrder()->take(rand(1, 3))->pluck('id')->toArray();
            foreach ($branchIds as $branchId) {
                AssetsBranchValues::create([
                    'asset_id' => $asset->id,
                    'asset_branch_id' => $branchId,
                    'asset_location_id' => AssetsBranch::inRandomOrder()->first()->id,
                    'asset_current_unit' => rand(1, 20),
                ]);
            }
        });
    }
}
