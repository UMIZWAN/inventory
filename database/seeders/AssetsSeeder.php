<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Assets;
use App\Models\AssetsBranch;
use App\Models\AssetsBranchValues;
use App\Models\AssetsCategory;
use App\Models\AssetsTag;

class AssetsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create asset categories
        collect(['Electronics', 'Furniture', 'Office Supplies', 'Vehicles', 'Tools'])
            ->each(fn($name) => AssetsCategory::create(['name' => $name]));

        // Create asset tags
        collect(['High Value', 'Low Value', 'Consumable', 'Depreciated', 'New'])
            ->each(fn($name) => AssetsTag::create(['name' => $name]));

        // Create branches
        $branches = collect(['HQKK', 'HQTWU'])
            ->map(fn($name) => AssetsBranch::create(['name' => $name]));

        // Create 50 assets with branch values
        Assets::factory(50)->create()->each(function ($asset) use ($branches) {
            // Pick random unique branches for each asset (1–3)
            $selectedBranches = $branches->random(rand(1, 3));

            foreach ($selectedBranches as $branch) {
                AssetsBranchValues::create([
                    'asset_id' => $asset->id,
                    'asset_branch_id' => $branch->id,
                    'asset_location_id' => $branches->random()->id,
                    'asset_current_unit' => rand(1, 20),
                ]);
            }
        });
    }
}
