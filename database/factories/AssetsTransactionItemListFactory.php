<?php

namespace Database\Factories;

use App\Models\AssetsTransactionItemList;
use App\Models\AssetsTransaction;
use App\Models\Assets;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetsTransactionItemListFactory extends Factory
{
    protected $model = AssetsTransactionItemList::class;

    public function definition(): array
    {
        return [
            'asset_transaction_id' => AssetsTransaction::factory(),
            'asset_id' => Assets::inRandomOrder()->first()?->id ?? Assets::factory(),
            'status' => $this->faker->randomElement(AssetsTransactionItemList::STATUSES),
            'asset_unit' => (string) $this->faker->numberBetween(50, 200),
        ];
    }
}
