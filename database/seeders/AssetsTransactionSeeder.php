<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AssetsTransaction;
use App\Models\AssetsTransactionItemList;
use App\Models\Assets;

class AssetsTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        // Create 40 asset transactions
        AssetsTransaction::factory(40)->create()->each(function ($transaction) {
            // For each transaction, create between 1 and 5 transaction items
            $assets = Assets::inRandomOrder()->take(rand(1, 5))->get();

            foreach ($assets as $asset) {
                AssetsTransactionItemList::create([
                    'asset_transaction_id' => $transaction->id,
                    'purchase_order_id' => $transaction->purchase_order_id,
                    'asset_id' => $asset->id,
                    'status' => $transaction->assets_transaction_type === 'ASSET IN' ?
                        $this->getRandomStatusForIn() : $this->getRandomStatusForOut(),
                    'asset_unit' => rand(1, 10),
                ]);
            }
        });
    }

    private function getRandomStatusForIn()
    {
        return fake()->randomElement(['DELIVERED', 'RECEIVED']);
    }

    private function getRandomStatusForOut()
    {
        return fake()->randomElement(['ON HOLD', 'FROZEN', 'RETURNED', 'DISPOSED']);
    }
}
