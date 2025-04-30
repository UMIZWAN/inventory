<?php

namespace Database\Seeders;

use App\Models\AssetsBranch;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AssetsBranch::factory(3)->create();
        // Create your 3 specific users
        User::create([
            'name' => 'MOHD IZWAN BIN MANDA',
            'email' => 'mohdizwanmanda@gmail.com',
            'password' => Hash::make('12345678'),
            'branch_id' => 1,
            'access_level_id' => 2,
        ]);

        User::create([
            'name' => 'KAMALEIAH BINTI HARUN',
            'email' => 'kamal@gmail.com',
            'password' => Hash::make('12345678'),
            'branch_id' => 1,
            'access_level_id' => 3,
        ]);

        User::create([
            'name' => 'SABRINA BINTI MOHD YUSOF',
            'email' => 'sabrina@gmail.com',
            'password' => Hash::make('12345678'),
            'branch_id' => 1,
            'access_level_id' => 1,
        ]);

        // Create 7 more random users to make a total of 10
        User::factory(7)->create();

        
    }
}
