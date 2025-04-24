<?php

namespace Database\Seeders;

use App\Models\Tax;
use Illuminate\Database\Seeder;

class TaxSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create standard tax rates
        Tax::create([
            'tax_name' => 'No Tax',
            'tax_percentage' => 0,
        ]);

        Tax::create([
            'tax_name' => 'Standard GST',
            'tax_percentage' => 7.5,
        ]);

        Tax::create([
            'tax_name' => 'Sales Tax',
            'tax_percentage' => 6,
        ]);

        // Add some random tax rates
        Tax::factory(3)->create();
    }
}
