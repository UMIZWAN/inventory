<?php

namespace Database\Seeders;

use App\Models\Suppliers;
use Illuminate\Database\Seeder;

class SuppliersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Suppliers::factory(10)->create();
    }
}
