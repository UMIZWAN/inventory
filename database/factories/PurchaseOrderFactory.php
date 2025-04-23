<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PurchaseOrder;
use App\Models\Suppliers;
use App\Models\Tax;

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
    public function definition(): array
    {
        return [
            'supplier_id' => Suppliers::factory(), // Will create a supplier automatically
            'expected_receipt_date' => $this->faker->date,
            'tax_id' => Tax::factory(),  // Will create a tax record automatically
            'billing_address' => $this->faker->address,
            'shipping_address' => $this->faker->address,
            'tracking_ref' => $this->faker->uuid,
            'purchase_order_notes' => $this->faker->text,
            'purchase_internal_notes' => $this->faker->text,
            'purchase_order_running_number' => $this->faker->unique()->numerify('PO-####'),
            'created_by' => null,  // You can link it to a user if needed
            'updated_by' => null,  // Same as above
            'received_by' => null, // Same as above
            'approved_by' => null, // Same as above
        ];
    }
}
