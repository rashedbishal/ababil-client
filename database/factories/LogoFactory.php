<?php

namespace Database\Factories;

use App\Enums\LogoSlot;
use App\Models\Logo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Logo>
 */
class LogoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slot' => LogoSlot::Site,
            'image_path' => 'logos/'.fake()->uuid().'.webp',
            'variants' => null,
        ];
    }

    public function forSlot(LogoSlot $slot): static
    {
        return $this->state(fn (array $attributes) => ['slot' => $slot]);
    }
}
