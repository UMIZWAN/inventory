<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PurchaseOrder;
use App\Models\Suppliers;
use App\Models\Tax;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PurchaseOrder>
 */
class PurchaseOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = PurchaseOrder::class;

    public function definition(): array
    {
        $createdByUser = User::inRandomOrder()->first();
        $updatedByUser = User::inRandomOrder()->first();
        $receivedByUser = User::inRandomOrder()->first();
        $approvedByUser = User::inRandomOrder()->first();
        return [
            'supplier_id' => Suppliers::factory(),
            'expected_receipt_date' => $this->faker->dateTimeBetween('now', '+3 months'),
            'tax_id' => Tax::factory(),
            'billing_address' => $this->faker->address(),
            'shipping_address' => $this->faker->address(),
            'tracking_ref' => $this->faker->unique()->regexify('[A-Z]{2}[0-9]{8}'),
            'purchase_order_notes' => $this->faker->text(),
            'purchase_internal_notes' => $this->faker->text(),
            'purchase_order_running_number' => 'PO-' . $this->faker->unique()->numerify('######'),
            'created_by' => $createdByUser->id,
            'updated_by' => $updatedByUser->id,
            'received_by' => $this->faker->boolean(70) ? $receivedByUser->id : null,
            'approved_by' => $this->faker->boolean(60) ? $approvedByUser->id : null,
            'created_at' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'updated_at' => $this->faker->dateTimeBetween('-5 months', 'now'),
            'received_at' => $this->faker->boolean(70) ? $this->faker->dateTimeBetween('-4 months', 'now') : null,
            'approved_at' => $this->faker->boolean(60) ? $this->faker->dateTimeBetween('-3 months', 'now') : null,
        ];
    }
}
