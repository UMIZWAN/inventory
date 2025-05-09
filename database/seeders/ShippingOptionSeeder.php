<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingOptionSeeder extends Seeder
{
    public function run()
    {
        // Insert OPTIONS
        $shipping_options = ['BUS', 'JNT',  'NINJAVAN', 'POSLAJU'];

        foreach ($shipping_options as $name) {
            DB::table('shipping_option')->insert([
                'shipping_option_name' => $name
            ]);
        }
    }
}
