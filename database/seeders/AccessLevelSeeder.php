<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AccessLevel;

class AccessLevelSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        AccessLevel::factory()->create(['name' => 'Admin', 'add_asset' => true, 'edit_asset' => true, 'delete_asset' => true]);
        AccessLevel::factory()->create(['name' => 'Editor', 'add_asset' => true, 'edit_asset' => true, 'delete_asset' => false]);
        AccessLevel::factory()->create(['name' => 'Viewer', 'add_asset' => false, 'edit_asset' => false, 'delete_asset' => false]);
    }
}
