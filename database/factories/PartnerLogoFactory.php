<?php

namespace Database\Factories;

use App\Models\PartnerLogo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartnerLogo>
 */
class PartnerLogoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'image_path' => 'partners/'.fake()->uuid().'.webp',
            'label' => fake()->words(2, true),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
