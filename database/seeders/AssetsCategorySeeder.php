<?php

namespace Database\Seeders;

use App\Models\AssetsCategory;
use Illuminate\Database\Seeder;

class AssetsCategorySeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics'],
            ['name' => 'Furniture'],
            ['name' => 'Branch Assets'],
            ['name' => 'Apparel & Accessories'],
            ['name' => 'Tools & Equipment'],
            ['name' => 'Cleaning & Sanitation'],
        ];

        foreach ($categories as $category) {
            AssetsCategory::create($category);
        }
    }
}
