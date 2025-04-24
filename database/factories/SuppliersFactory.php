<?php

namespace Database\Factories;

use App\Models\Suppliers;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Suppliers>
 */
class SuppliersFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Suppliers::class;

    public function definition(): array
    {
        return [
            'supplier_name' => $this->faker->company(),
            'supplier_office_number' => $this->faker->phoneNumber(),
            'supplier_email' => $this->faker->companyEmail(),
            'supplier_address' => $this->faker->address(),
        ];
    }
}
