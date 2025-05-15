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
            'name' => $this->faker->unique()->jobTitle(),

            // Settings
            'settings' => $this->faker->boolean(),

            // Role
            'add_edit_role' => $this->faker->boolean(),
            'view_role' => $this->faker->boolean(),

            // User
            'add_edit_user' => $this->faker->boolean(),
            'view_user' => $this->faker->boolean(),

            // Asset
            'add_edit_asset' => $this->faker->boolean(),
            'view_asset' => $this->faker->boolean(),
            'view_asset_masterlist' => $this->faker->boolean(),

            // Branch
            'add_edit_branch' => $this->faker->boolean(),
            'view_branch' => $this->faker->boolean(),

            // Transaction
            'add_edit_transaction' => $this->faker->boolean(),
            'view_transaction' => $this->faker->boolean(),
            'approve_reject_transaction' => $this->faker->boolean(),
            'receive_transaction' => $this->faker->boolean(),

            // Purchase Order
            'add_edit_purchase_order' => $this->faker->boolean(),
            'view_purchase_order' => $this->faker->boolean(),

            // Supplier
            'add_edit_supplier' => $this->faker->boolean(),
            'view_supplier' => $this->faker->boolean(),

            // Tax
            'add_edit_tax' => $this->faker->boolean(),
            'view_tax' => $this->faker->boolean(),

            // Reports
            'view_reports' => $this->faker->boolean(),
            'download_reports' => $this->faker->boolean(),
        ];
    }
}
