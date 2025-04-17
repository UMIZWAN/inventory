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
        AssetsBranch::factory()->create(['name' => 'UMKK1']);
        AssetsBranch::factory()->create(['name' => 'UMKK2']);
        AssetsBranch::factory()->create(['name' => 'UMTWU']);
        AssetsCategory::factory()->create(['name' => 'Electronics']);
        AssetsCategory::factory()->create(['name' => 'Furniture']);
        AssetsCategory::factory()->create(['name' => 'Stationery']);
        AssetsTag::factory()->create(['name' => 'Assembly']);
        AssetsTag::factory()->create(['name' => 'Component']);
        Assets::factory()->create([
            'name' => 'Thinkpad',
            'asset_running_number' => 'E-0001',
            'asset_type' => 'Laptop',
            'asset_category_id' => 1,
            'asset_tag_id' => 1,
            'asset_stable_value' => 10,
            'asset_current_value' => 5,
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
        Assets::factory()->create([
            'name' => 'Thinkpad X1 Carbon',
            'asset_running_number' => 'E-0002',
            'asset_type' => 'Laptop',
            'asset_category_id' => 1,
            'asset_tag_id' => 1,
            'asset_stable_value' => 5,
            'asset_current_value' => 2,
            'assets_branch_id' => 1,
            'assets_location' => 'Office',
            'assets_remark' => [
                "New Laptop for staff",
                "Laptop repaired"
            ],
            "assets_log" => [
                "Laptop Entered by Izwan",
                "Laptop repaired by Izwan",
                "Laptop repaired by Ahmad"
            ],
        ]);
        Assets::factory()->create([
            'name' => 'A4 Printer',
            'asset_running_number' => 'E-0003',
            'asset_type' => 'Printer',
            'asset_category_id' => 1,
            'asset_tag_id' => 1,
            'asset_stable_value' => 6,
            'asset_current_value' => 2,
            'assets_branch_id' => 1,
            'assets_location' => 'Office',
            'assets_remark' => [
                "New Laptop for staff",
                "Laptop repaired"
            ],
            "assets_log" => [
                "Printer Entered by Izwan"
            ],
        ]);
    }
}
