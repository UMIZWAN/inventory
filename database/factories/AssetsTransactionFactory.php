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
        $transactionType = $this->faker->randomElement(['ASSET IN', 'ASSET OUT']);
        $transactionPurpose = $transactionType === 'ASSET IN'
            ? 'ASSET IN'
            : $this->faker->randomElement(['INSURANCE', 'CSI', 'EVENT/ ROADSHOW', 'SPECIAL REQUEST']);

        return [
            'assets_transaction_running_number' => 'TRX-' . $this->faker->unique()->numerify('######'),
            'purchase_order_id' => $transactionType === 'ASSET IN' ? PurchaseOrder::factory() : null,
            'assets_transaction_type' => $transactionType,
            'assets_transaction_status' => $this->faker->randomElement(['PENDING', 'APPROVED', 'REJECTED']),
            'assets_transaction_purpose' => $transactionPurpose,
            'assets_from_branch_id' => AssetsBranch::factory(),
            'assets_to_branch_id' => AssetsBranch::factory(),
            'assets_transaction_remark' => $this->faker->sentence(),
            'assets_transaction_log' => json_encode([
                'created' => $this->faker->dateTime()->format('Y-m-d H:i:s'),
                'updated' => $this->faker->dateTime()->format('Y-m-d H:i:s'),
            ]),
            'created_by' => User::factory(),
            'updated_by' => User::factory(),
            'received_by' => $this->faker->boolean(70) ? User::factory() : null,
            'approved_by' => $this->faker->boolean(60) ? User::factory() : null,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-5 months', 'now'),
            'received_at' => $this->faker->boolean(70) ? $this->faker->dateTimeBetween('-4 months', 'now') : null,
            'approved_at' => $this->faker->boolean(60) ? $this->faker->dateTimeBetween('-3 months', 'now') : null,
        ];

        // return [
        //     'assets_transaction_running_number' => $transactionNumber,
        //     'users_id' => $user->id,
        //     'assets_transaction_type' => $this->faker->randomElement($types),
        //     'assets_transaction_status' => $this->faker->randomElement($statuses),
        //     'assets_transaction_purpose' => $this->faker->randomElement(['INSURANCE', 'CSI', 'EVENT/ ROADSHOW', 'SPECIAL REQUEST']),
        //     'assets_from_branch_id' => AssetsBranch::inRandomOrder()->first()?->id ?? AssetsBranch::factory(),
        //     'assets_to_branch_id' => AssetsBranch::inRandomOrder()->first()?->id ?? AssetsBranch::factory(),
        //     'assets_transaction_remark' => $this->faker->optional()->sentence(),
        //     'assets_transaction_log' => null,
        //     'created_by' => $user->id,
        //     'created_at' => now(),
        //     'updated_by' => null,
        //     'updated_at' => null,
        //     'received_by' => null,
        //     'received_at' => null,
        //     'approved_by' => null,
        //     'approved_at' => null,
        // ];
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
