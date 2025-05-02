<?php

namespace Database\Seeders;

use App\Models\AssetsTag;
use Illuminate\Database\Seeder;

class AssetsTagSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tags = [
            ['name' => 'Customer Gift'],
            ['name' => 'Internal Use'],
            ['name' => 'Branch Assets'],
            ['name' => 'Leased Equipment'],
            ['name' => 'IT Hardware'],
            ['name' => 'Office Furniture'],
            ['name' => 'Promotional Material'],
            ['name' => 'Spare Parts'],
            ['name' => 'Safety Equipment'],
            ['name' => 'Demo Units'],
        ];

        foreach ($tags as $tag) {
            AssetsTag::create($tag);
        }
    }
}
