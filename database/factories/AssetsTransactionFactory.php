<?php

namespace Database\Factories;

use App\Models\AssetsTransaction;
use App\Models\AssetsTransactionItemList;
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
            $status = $this->faker->randomElement(['DRAFT', 'IN-TRANSFER', 'RECEIVED']);
        }

        return [
            'assets_transaction_running_number' => 'TRX-' . $this->faker->unique()->numerify('######'),
            'purchase_order_id' => $transactionType === 'ASSET IN' ? PurchaseOrder::factory() : null,
            'assets_transaction_type' => $transactionType,
            'assets_transaction_status' => $status,
            'assets_transaction_purpose' => $this->getRandomPurposes(),
            'assets_from_branch_id' => AssetsBranch::factory(),
            'assets_to_branch_id' => AssetsBranch::factory(),
            'assets_transaction_total_cost' => $this->faker->randomFloat(2, 1000, 100000),
            'assets_transaction_remark' => $this->faker->sentence(),
            'assets_transaction_log' => [
                "Created by " . $this->faker->name()
            ],
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
            'received_by' => $this->faker->boolean(70) ? User::factory() : null,
            'approved_by' => $this->faker->boolean(60) ? User::factory() : null,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-5 months', 'now'),
            'received_at' => $this->faker->boolean(70) ? $this->faker->dateTimeBetween('-4 months', 'now') : null,
            'approved_at' => $this->faker->boolean(60) ? $this->faker->dateTimeBetween('-3 months', 'now') : null,
        ];
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
            'ASSET TRANSFER',
        ];

        return collect($possiblePurposes)
            ->shuffle()
            ->take(rand(1, 3))
            ->values()
            ->toArray();
    }

    // public function configure()
    // {
    //     return $this->afterCreating(function (AssetsTransaction $transaction) {
    //         $count = fake()->numberBetween(1, 3);

    //         AssetsTransactionItemList::factory()
    //             ->count($count)
    //             ->create([
    //                 'asset_transaction_id' => $transaction->id,
    //             ]);
    //     });
    // }

    // public function approved()
    // {
    //     return $this->state(function (array $attributes) {
    //         $approver = User::inRandomOrder()->first()?->id ?? User::factory();

    //         return [
    //             'assets_transaction_status' => 'APPROVED',
    //             'approved_by' => $approver,
    //             'approved_at' => now(),
    //         ];
    //     });
    // }

    // public function ofType($type)
    // {
    //     return $this->state(function (array $attributes) use ($type) {
    //         $purpose = null;

    //         if ($type === 'ASSET IN') {
    //             $purpose = 'ASSET IN';
    //         } else {
    //             $purpose = fake()->randomElement(['INSURANCE', 'CSI', 'EVENT/ ROADSHOW', 'SPECIAL REQUEST']);
    //         }

    //         return [
    //             'assets_transaction_type' => $type,
    //             'assets_transaction_purpose' => $purpose,
    //         ];
    //     });
    // }
}
