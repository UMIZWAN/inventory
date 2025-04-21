<?php

namespace Database\Factories;


use App\Models\Assets;
use App\Models\AssetsTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetsTransactionItemList>
 */
class AssetsTransactionItemListFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'asset_transaction_id' => AssetsTransaction::factory(),
            'asset_id' => Assets::pluck('id')->random() ?? 1,
            'transaction_value' => (string)$this->faker->numberBetween(100, 10000),
        ];
    }
}
