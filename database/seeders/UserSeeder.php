<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create(
            [
                'name' => 'MOHD IZWAN BIN MANDA',
                'email' => 'mohdizwanmanda@gmail.com',
                'password' => bcrypt('12345678'),
                'access_level_id' => 1,
            ]
        );
        User::factory()->create(
            [
                'name' => 'KAMALEIAH BINTI HARUN',
                'email' => 'kamal@gmail.com',
                'password' => bcrypt('12345678'),
                'access_level_id' => 2,
            ]
        );
        User::factory()->create(
            [
                'name' => 'SABRINA BINTI MOHD YUSOF',
                'email' => 'sabrina@gmail.com',
                'password' => bcrypt('12345678'),
                'access_level_id' => 3,
            ]
        );
    }
}
