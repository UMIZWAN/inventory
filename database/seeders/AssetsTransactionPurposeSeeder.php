<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssetsTransactionPurposeSeeder extends Seeder
{
    public function run()
    {
        // Insert OPTIONS
        $transaction_purpose = ['CASH', 'CREDIT'];

        foreach ($transaction_purpose as $name) {
            DB::table('assets_transaction_purpose')->insert([
                'asset_transaction_purpose_name' => $name
            ]);
        }
    }
}
