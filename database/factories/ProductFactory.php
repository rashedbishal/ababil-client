<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $words = fake()->unique()->words(3);
        $name = ucfirst(implode(' ', is_array($words) ? $words : [$words]));
        $regularPrice = fake()->randomFloat(2, 500, 5000);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1000, 9999),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'short_description' => fake()->sentence(12),
            'description' => fake()->paragraphs(3, true),
            'regular_price' => $regularPrice,
            'sale_price' => null,
            'track_stock' => true,
            'stock' => fake()->numberBetween(0, 200),
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function onSale(): static
    {
        return $this->state(fn (array $attributes) => [
            'sale_price' => round(((float) $attributes['regular_price']) * 0.8, 2),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
