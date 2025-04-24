<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\AssetsBranch;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssetsBranch>
 */
class AssetsBranchFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = AssetsBranch::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
        ];
    }
}
