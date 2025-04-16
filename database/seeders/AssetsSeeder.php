<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Assets;
use App\Models\AssetsBranch;
use App\Models\AssetsCategory;
use App\Models\AssetsTag;

class AssetsSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        AssetsBranch::factory()->create(['name' => 'UMG']);
        AssetsCategory::factory()->create(['name' => 'Electronics']);
        AssetsTag::factory()->create(['name' => 'Component']);
        Assets::factory()->create([
            'name' => 'Laptop',
            'asset_running_number' => '12345',
            'asset_type' => 'Laptop',
            'asset_category_id' => 1,
            'asset_tag_id' => 1,
            'asset_stable_value' => 1000,
            'asset_current_value' => 900,
            'assets_branch_id' => 1,
            'assets_location' => 'Office',
            'assets_remark' => [
                "New Laptop for staff",
                "Laptop repaired"
            ],
            "assets_log" => [
                "Laptop Entered by Izwan"
            ],
        ]);
    }
}
