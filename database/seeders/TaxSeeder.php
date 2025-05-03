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
            'tax_name' => 'GST',
            'tax_percentage' => 7.5,
        ]);

        Tax::create([
            'tax_name' => 'SST',
            'tax_percentage' => 6.5,
        ]);

        Tax::create([
            'tax_name' => 'Markup',
            'tax_percentage' => 6,
        ]);
    }
}
