<?php

// namespace Database\Factories;

// use App\Models\AccessLevel;
// use App\Models\AssetsBranch;
// use App\Models\User;
// use Illuminate\Database\Eloquent\Factories\Factory;
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Str;

// /**
//  * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
//  */
// class UserFactory extends Factory
// {
//     /**
//      * The current password being used by the factory.
//      */
//     protected static ?string $password;

//     /**
//      * The model that the factory creates.
//      *
//      * @var string
//      */
//     protected $model = User::class;

//     /**
//      * Define the model's default state.
//      *
//      * @return array<string, mixed>
//      */
//     public function definition(): array
//     {
//         return [
//             'name' => fake()->name(),
//             'email' => fake()->unique()->safeEmail(),
//             'email_verified_at' => now(),
//             'password' => static::$password ??= Hash::make('password'),
//             'remember_token' => Str::random(10),
//             'branch_id' => $this->getBranchId(),
//             'access_level_id' => $this->getAccessLevelId(),
//         ];
//     }

//     /**
//      * Get a random branch ID from existing branches.
//      *
//      * @return int
//      */
//     protected function getBranchId(): int
//     {
//         $branch = AssetsBranch::inRandomOrder()->first();
//         return $branch ? $branch->id : 1; // Default to ID 1 if no branches exist
//     }

//     /**
//      * Get a random access level ID from existing access levels.
//      *
//      * @return int
//      */
//     protected function getAccessLevelId(): int
//     {
//         $accessLevel = AccessLevel::inRandomOrder()->first();
//         return $accessLevel ? $accessLevel->id : 1; // Default to ID 1 if no access levels exist
//     }

//     /**
//      * Indicate that the model's email address should be unverified.
//      */
//     public function unverified(): static
//     {
//         return $this->state(fn(array $attributes) => [
//             'email_verified_at' => null,
//         ]);
//     }
// }
