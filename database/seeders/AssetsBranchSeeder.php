<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetsBranchSeeder extends Seeder
{
    public function run()
    {
        // // Clear the table
        // DB::statement('SET FOREIGN_KEY_CHECKS=0');
        // DB::table('assets_branch')->truncate();
        // DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        // Insert branches
        $branches = ['HQKK', 'UMKK1', 'UMKK2', 'UCH', 'UJ'];
        
        foreach ($branches as $name) {
            DB::table('assets_branch')->insert([
                'name' => $name,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }
}
