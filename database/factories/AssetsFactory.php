<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assets>
 */
class AssetsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(), // Generate a unique word for the asset name
            'asset_running_number' => $this->faker->unique()->numerify('#####'), // Random 5-digit number
            'asset_type' => $this->faker->randomElement(['Laptop', 'Monitor', 'Printer']),
            'asset_category_id' => $this->faker->numberBetween(1, 5),
            'asset_tag_id' => $this->faker->numberBetween(1, 5),
            'asset_stable_value' => $this->faker->numberBetween(800, 2000),
            'asset_current_value' => $this->faker->numberBetween(500, 1999),
            'assets_branch_id' => $this->faker->numberBetween(1, 3),
            'assets_location' => $this->faker->city(),
            'assets_remark' => [
                $this->faker->sentence(),
                $this->faker->sentence()
            ],
            'assets_log' => [
                'Created by ' . $this->faker->name(),
            ],
        ];
    }
}
