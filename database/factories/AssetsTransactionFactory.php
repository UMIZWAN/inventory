<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetsTransaction>
 */
class AssetsTransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Get random user ID or create fallback
        $userId = User::pluck('id')->random() ?? 1;

        // Transaction types and statuses
        $types = ['ASSET IN', 'ASSET OUT', 'ASSET TRANSFER'];
        $statuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];

        // Generate a unique running number
        static $runningNumber = 1;
        $transactionNumber = sprintf('AR-%03d', $runningNumber++);

        return [
            'assets_transaction_running_number' => $transactionNumber,
            'users_id' => $userId,
            'assets_transaction_type' => $this->faker->randomElement($types),
            'assets_transaction_status' => $this->faker->randomElement($statuses),
            'created_by' => $userId,
            'updated_by' => null,
            'received_by' => null,
            'received_at' => null,
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * Configure the model factory.
     */
    public function configure()
    {
        return $this->afterCreating(function (\App\Models\AssetsTransaction $transaction) {
            // Create 1-3 items for this transaction
            \App\Models\AssetsTransactionItemList::factory()
                ->count($this->faker->numberBetween(1, 3))
                ->create([
                    'asset_transaction_id' => $transaction->id
                ]);
        });
    }

    /**
     * Indicate the transaction is approved.
     */
    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'assets_transaction_status' => 'APPROVED',
                'approved_by' => User::pluck('id')->random(),
                'approved_at' => now(),
            ];
        });
    }

    /**
     * Indicate the transaction is a specific type.
     */
    public function ofType($type)
    {
        return $this->state(function (array $attributes) use ($type) {
            return [
                'assets_transaction_type' => $type,
            ];
        });
    }
}
