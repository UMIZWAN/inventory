<?php

namespace Database\Seeders;

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
        AssetsTransaction::factory(10)->create()->each(function ($transaction) {
            $newStatus = null;
            if ($transaction->assets_transaction_type === 'ASSET TRANSFER') {
                $newStatus = $this->getRandomStatusForTransfer();
            }

            $transaction->update([
                'assets_transaction_status' => $newStatus,
                'assets_transaction_purpose' => json_encode($this->getRandomPurposes()),
            ]);

            $assets = Assets::inRandomOrder()->take(rand(1, 5))->get();

            foreach ($assets as $asset) {
                AssetsTransactionItemList::create([
                    'asset_transaction_id' => $transaction->id,
                    'purchase_order_id' => $transaction->purchase_order_id,
                    'asset_id' => $asset->id,
                    'status' => $this->getItemStatus($transaction->assets_transaction_type),
                    'asset_unit' => rand(1, 10),
                ]);
            }
        });
    }

    private function getRandomStatusForTransfer()
    {
        return fake()->randomElement(['DRAFT', 'IN-TRANSIT', 'RECEIVED']);
    }

    private function getRandomPurposes()
    {
        $possiblePurposes = [
            'INSURANCE',
            'CSI',
            'EVENT/ROADSHOW',
            'SPECIAL REQUEST',
            'ASSET IN',
            'ASSET OUT',
            'ASSET TRANSFER'
        ];

        return collect($possiblePurposes)
            ->shuffle()
            ->take(rand(1, 3))
            ->values()
            ->toArray();
    }

    private function getItemStatus($transactionType)
    {
        if ($transactionType === 'ASSET IN') {
            return fake()->randomElement(['DELIVERED', 'RECEIVED']);
        } else if ($transactionType === 'ASSET OUT') {
            return fake()->randomElement(['ON HOLD', 'FROZEN', 'RETURNED', 'DISPOSED']);
        } else {
            // ASSET TRANSFER
            return fake()->randomElement(['DELIVERED', 'RECEIVED']);
        }
    }
}
