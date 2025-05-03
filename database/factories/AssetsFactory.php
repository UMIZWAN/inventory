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
            'name' => $this->faker->unique()->randomElement([
                'Laptop',
                'Desktop PC',
                'Monitor',
                'Keyboard',
                'Mouse',
                'Printer',
                'Scanner',
                'Projector',
                'Router',
                'Switch',
                'Desk',
                'Office Chair',
                'Filing Cabinet',
                'Whiteboard',
                'Shredder',
                'Air Conditioner',
                'Fire Extinguisher',
                'Safety Helmet',
                'Drill Machine',
                'Label Printer',
                'Tablet',
                'Smartphone',
                'Power Strip',
                'UPS Battery Backup',
                'Network Cable',
                'Server Rack',
                'Extension Cord',
                'Wall Clock',
                'Water Dispenser',
                'Coffee Maker',
                'CCTV Camera',
                'Biometric Scanner',
                'Hand Sanitizer Dispenser',
                'Trash Bin',
                'First Aid Kit',
                'Storage Cabinet',
                'Toolbox',
                'Measuring Tape',
                'Work Gloves',
                'Ladder',
                'Mop Bucket',
                'Vacuum Cleaner',
                'Smoke Detector',
                'Projector Screen',
                'HDMI Cable',
                'Microphone',
                'Speaker System',
                'Smart TV',
                'Barcode Scanner',
                'Cash Register',
                'POS Terminal',
                'Label Maker',
                'Photocopier',
                'Binder Machine',
                'Laminator',
                'Envelopes Box',
                'Stationery Set',
                'Wi-Fi Repeater',
                'Ethernet Switch',
                'Laser Pointer',
                'Power Drill',
                'Cable Organizer',
                'External Hard Drive',
            ]),
            'asset_running_number' => 'AST-' . $this->faker->unique()->numerify('######'),
            'asset_description' => $this->faker->paragraph(),
            'asset_type' => $this->faker->randomElement(['Red', 'Blue', 'Green']),
            'asset_category_id' => AssetsCategory::inRandomOrder()->first()->id,
            'asset_tag_id' => AssetsTag::inRandomOrder()->first()->id,
            'asset_stable_unit' => $this->faker->numberBetween(10, 100),
            'asset_purchase_cost' => $this->faker->randomFloat(2, 100, 5000),
            'asset_sales_cost' => $this->faker->randomFloat(2, 200, 6000),
            'asset_unit_measure' => $this->faker->randomElement(['pieces', 'kg', 'liters', 'boxes', 'units']),
            'asset_image' => $this->faker->imageUrl(),
            'assets_remark' => $this->faker->sentence(),
            'assets_log' => [
                "Created by " . $this->faker->name()
            ],
        ];
    }
}
