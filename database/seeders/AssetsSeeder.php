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
        // Get existing branches
        $branches = AssetsBranch::all();
        
        if ($branches->isEmpty()) {
            $this->command->error('No branches found. Please run AssetsBranchSeeder first.');
            return;
        }

        // Create 20 assets
        $assets = Assets::factory(20)->create();
        
        // Create branch values for EACH asset in EACH branch
        foreach ($assets as $asset) {
            foreach ($branches as $branch) {
                AssetsBranchValues::create([
                    'asset_id' => $asset->id,
                    'asset_branch_id' => $branch->id,
                    'asset_location_id' => $branch->id, // Same branch as location
                    'asset_current_unit' => rand(1, 20),
                ]);
            }
        }
        
        $this->command->info('Created ' . Assets::count() . ' assets with branch values for all ' . $branches->count() . ' branches');
    }
}
