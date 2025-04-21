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
            'asset_stable_value' => $this->faker->numberBetween(10, 20),
            'asset_current_value' => $this->faker->numberBetween(20, 40),
            'asset_purchase_cost' => $this->faker->randomFloat(2, 500, 2000), // Random cost
            'asset_sales_cost' => $this->faker->randomFloat(2, 400, 1800), // Random sales cost
            'asset_unit_measure' => $this->faker->randomElement(['Unit', 'Piece', 'Set']),
            'assets_branch_id' => $this->faker->numberBetween(1, 3),
            'assets_location_id' => $this->faker->numberBetween(1, 3), // Assuming this is a reference to branches
            'asset_image' => $this->faker->imageUrl(), // Generate a random image URL
            'assets_remark' => json_encode([ // Encoding array into JSON
                $this->faker->sentence(),
                $this->faker->sentence()
            ]),
            'assets_log' => json_encode([ // Encoding array into JSON
                'Created by ' . $this->faker->name(),
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
