<?php

namespace Database\Factories;

use App\Models\BlockedIp;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlockedIp>
 */
class BlockedIpFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ip_address' => fake()->unique()->ipv4(),
            'reason' => fake()->sentence(),
            'blocked_at' => now(),
            'expires_at' => null,
            'is_active' => true,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
