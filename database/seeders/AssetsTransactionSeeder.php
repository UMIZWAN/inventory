<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AssetsTransaction;

class AssetsTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // AssetsTransaction::factory()
        //     ->count(10)
        //     ->create();

        // Create some specific transaction types
        AssetsTransaction::factory()
            ->count(3)
            ->ofType('ASSET IN')
            ->approved()
            ->create();
        
        AssetsTransaction::factory()
            ->count(7)
            ->ofType('ASSET OUT')
            ->create();
    }
}
