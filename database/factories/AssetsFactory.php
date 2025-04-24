<?php

namespace Database\Factories;

use App\Models\Assets;
use App\Models\AssetsCategory;
use App\Models\AssetsTag;
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

    protected $model = Assets::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'asset_running_number' => 'AST-' . $this->faker->unique()->numerify('######'),
            'asset_description' => $this->faker->paragraph(),
            'asset_type' => $this->faker->randomElement(['Type A', 'Type B', 'Type C']),
            'asset_category_id' => AssetsCategory::factory(),
            'asset_tag_id' => AssetsTag::factory(),
            'asset_stable_unit' => $this->faker->numberBetween(10, 100),
            'asset_purchase_cost' => $this->faker->randomFloat(2, 100, 5000),
            'asset_sales_cost' => $this->faker->randomFloat(2, 200, 6000),
            'asset_unit_measure' => $this->faker->randomElement(['pieces', 'kg', 'liters', 'boxes']),
            'asset_image' => $this->faker->imageUrl(),
            'assets_remark' => $this->faker->sentence(),
            'assets_log' => [
                "Created by " . $this->faker->name()
            ],
        ];
    }
}
