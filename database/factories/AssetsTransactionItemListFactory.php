<?php

namespace Database\Factories;

use App\Models\AssetsTransactionItemList;
use App\Models\AssetsTransaction;
use App\Models\Assets;
use App\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssetsTransactionItemListFactory extends Factory
{
    protected $model = AssetsTransactionItemList::class;

    public function definition(): array
    {
        return [
            'asset_transaction_id' => AssetsTransaction::factory(),
            'purchase_order_id' => $this->faker->boolean(70) ? PurchaseOrder::factory() : null,
            'asset_id' => Assets::factory(),
            'status' => $this->faker->randomElement(['ON HOLD', 'DELIVERED', 'FROZEN', 'RECEIVED', 'RETURNED', 'DISPOSED']),
            'asset_unit' => $this->faker->numberBetween(1, 20),
        ];
    }
}
