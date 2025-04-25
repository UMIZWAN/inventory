<?php

namespace Database\Factories;

use App\Models\Assets;
use App\Models\AssetsBranch;
use App\Models\AssetsBranchValues;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetsBranchValues>
 */
class AssetsBranchValuesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = AssetsBranchValues::class;

    public function definition(): array
    {
        return [
            'asset_id' => Assets::factory(),
            'asset_branch_id' => AssetsBranch::factory(),
            'asset_location_id' => AssetsBranch::factory(),
            'asset_current_unit' => $this->faker->numberBetween(1, 50),
        ];
    }
}
