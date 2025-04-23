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
            'asset_current_value' => 7,
            'asset_purchase_cost' => 1000,  // Example value
            'asset_sales_cost' => 800,  // Example value
            'asset_unit_measure' => 'Unit',
            'assets_branch_id' => 1,
            'assets_location_id' => 1,  // Corrected to location ID
            'asset_image' => 'path/to/image.jpg',  // Example value
        ]);

        Assets::factory()->create([
            'name' => 'Thinkpad X1 Carbon',
            'asset_running_number' => 'E-0002',
            'asset_type' => 'Laptop',
            'asset_category_id' => 1,
            'asset_tag_id' => 1,
            'asset_stable_value' => 5,
            'asset_current_value' => 2,
            'asset_purchase_cost' => 1500,  // Example value
            'asset_sales_cost' => 1200,  // Example value
            'asset_unit_measure' => 'Unit',
            'assets_branch_id' => 1,
            'assets_location_id' => 1,  // Corrected to location ID
            'asset_image' => 'path/to/image2.jpg',  // Example value
        ]);

        Assets::factory()->create([
            'name' => 'A4 Printer',
            'asset_running_number' => 'E-0003',
            'asset_type' => 'Printer',
            'asset_category_id' => 1,
            'asset_tag_id' => 1,
            'asset_stable_value' => 6,
            'asset_current_value' => 10,
            'asset_purchase_cost' => 300,  // Example value
            'asset_sales_cost' => 250,  // Example value
            'asset_unit_measure' => 'Piece',
            'assets_branch_id' => 1,
            'assets_location_id' => 1,  // Corrected to location ID
            'asset_image' => 'path/to/image3.jpg',  // Example value
        ]);
    }
}
