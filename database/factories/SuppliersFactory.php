<?php

namespace Database\Factories;

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
    public function definition(): array
    {
        return [
            'tax_name' => $this->faker->word,
            'tax_percentage' => $this->faker->randomFloat(2, 0, 100),  // Random percentage between 0 and 100
        ];
    }
}
