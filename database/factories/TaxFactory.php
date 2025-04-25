<?php

namespace Database\Factories;

use App\Models\Tax;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tax>
 */
class TaxFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Tax::class;

    public function definition(): array
    {
        return [
            'tax_name' => $this->faker->randomElement(['GST', 'VAT', 'Sales Tax']),
            'tax_percentage' => $this->faker->randomFloat(2, 0, 20),
        ];
    }
}
