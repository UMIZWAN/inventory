<?php

namespace Database\Factories;

use App\Models\AssetsTransaction;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\AssetsBranch;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetsTransactionFactory extends Factory
{
    protected $model = AssetsTransaction::class;

    public function definition(): array
    {
        $transactionType = $this->faker->randomElement(['ASSET IN', 'ASSET OUT', 'ASSET TRANSFER']);

        // Set status depending on type
        $status = null;
        if ($transactionType === 'ASSET TRANSFER') {
            $status = $this->faker->randomElement(['DRAFT', 'IN-TRANSIT', 'RECEIVED']);
        }

        $purpose = null;
        if ($transactionType == 'ASSET OUT') {
            $purpose = $this->getRandomPurposes();
        }

        // Get random existing records
        $purchaseOrder = PurchaseOrder::inRandomOrder()->first();
        $fromBranch = AssetsBranch::inRandomOrder()->first();
        $toBranch = AssetsBranch::inRandomOrder()->first();
        $createdByUser = User::inRandomOrder()->first();
        $updatedByUser = User::inRandomOrder()->first();
        $receivedByUser = User::inRandomOrder()->first();
        $approvedByUser = User::inRandomOrder()->first();

        return [
            'assets_transaction_running_number' => 'TRX-' . $this->faker->unique()->numerify('######'),
            'supplier_id' => $transactionType === 'ASSET IN' ?
                ($purchaseOrder ? $purchaseOrder->supplier_id : null) : null,
            'assets_transaction_type' => $transactionType,
            'assets_shipping_option' => $transactionType === 'ASSET IN' ?
                $this->faker->randomElement(['AIR', 'SEA', 'ROAD', 'RAIL']) : null,

            'assets_transaction_status' => $status,
            'assets_transaction_purpose' => $transactionType === 'ASSET OUT' ?
                json_encode($this->getRandomPurposes()) : null,
            'assets_from_branch_id' => 1,
            'assets_to_branch_id' => $transactionType === 'ASSET TRANSFER' ?
                ($toBranch ? $toBranch->id : 1) : null,

            'assets_transaction_total_cost' => $this->faker->randomFloat(2, 1000, 100000),
            'assets_transaction_remark' => null,
            'assets_transaction_log' => [
                "Created by " . $this->faker->name()
            ],
            'created_by' => $createdByUser ? $createdByUser->id : 1,
            'updated_by' => $updatedByUser ? $updatedByUser->id : 1,
            'received_by' => $this->faker->boolean(70) ?
                ($receivedByUser ? $receivedByUser->id : 1) : null,
            'approved_by' => $this->faker->boolean(60) ?
                ($approvedByUser ? $approvedByUser->id : 1) : null,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-5 months', 'now'),
            'received_at' => $this->faker->boolean(70) ?
                $this->faker->dateTimeBetween('-4 months', 'now') : null,
            'approved_at' => $this->faker->boolean(60) ?
                $this->faker->dateTimeBetween('-3 months', 'now') : null,
        ];
    }

    private function getRandomPurposes()
    {
        $possiblePurposes = [
            'INSURANCE',
            'CSI',
            'EVENT/ROADSHOW',
            'SPECIAL REQUEST',
        ];

        return collect($possiblePurposes)
            ->shuffle()
            ->take(rand(1, 3))
            ->values()
            ->toArray();
    }
}
