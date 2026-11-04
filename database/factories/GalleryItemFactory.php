<?php

namespace Database\Factories;

use App\Enums\GallerySection;
use App\Models\GalleryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GalleryItem>
 */
class GalleryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'section' => GallerySection::Features,
            'image_path' => 'gallery/'.fake()->uuid().'.webp',
            'alt' => null,
            'caption' => fake()->sentence(3),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }

    public function inSection(GallerySection $section): static
    {
        return $this->state(fn (array $attributes) => [
            'section' => $section,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
