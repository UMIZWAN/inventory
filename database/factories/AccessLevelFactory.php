<?php

namespace Database\Factories;

use App\Models\AccessLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AccessLevel>
 */
class AccessLevelFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = AccessLevel::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(), // Generate a unique word for the name
            'add_asset' => $this->faker->boolean(), // Generate a random boolean (true or false)
            'edit_asset' => $this->faker->boolean(),
            'delete_asset' => $this->faker->boolean(),
        ];
    }
}
