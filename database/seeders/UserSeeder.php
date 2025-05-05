<?php

namespace Database\Seeders;

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
        User::create([
            'name' => 'DAYANG NUR HAFIZAH BINTI MOHD TAHIR',
            'email' => 'dayangnurhafizah@gmail.com',
            'password' => Hash::make('12345678'),
            'branch_id' => 1,
            'access_level_id' => 1,
        ]);
        User::create([
            'name' => 'SET YEE',
            'email' => 'setyee@gmail.com',
            'password' => Hash::make('12345678'),
            'branch_id' => 2,
            'access_level_id' => 1,
        ]);
    }
}
