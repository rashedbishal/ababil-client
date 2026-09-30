<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ShippingArea;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 500, 5000);
        $shippingCharge = fake()->randomElement([60, 100, 120]);
        $discount = 0;
        $grandTotal = $subtotal + $shippingCharge - $discount;

        return [
            'order_number' => 'ORD-'.now()->format('ymd').'-'.strtoupper(Str::random(6)),
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->numerify('01#########'),
            'delivery_address' => fake()->address(),
            'shipping_area_id' => ShippingArea::factory(),
            'shipping_area_name' => fake()->city(),
            'subtotal' => $subtotal,
            'shipping_charge' => $shippingCharge,
            'discount' => $discount,
            'grand_total' => $grandTotal,
            'status' => OrderStatus::Pending,
            'courier_status' => null,
            'customer_ip' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
        ];
    }

    public function withStatus(OrderStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }
}
