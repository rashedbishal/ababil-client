<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Setting;
use App\Models\ShippingArea;
use App\Models\Size;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'is_admin' => true,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->seedSettings();

        $sizes = collect(['S', 'M', 'L', 'XL', 'XXL'])
            ->map(fn (string $name, int $index) => Size::query()->create([
                'name' => $name,
                'slug' => strtolower($name),
                'sort_order' => $index,
                'is_active' => true,
            ]));

        $shippingAreas = [
            ['name' => 'Inside Dhaka', 'charge' => 70, 'sort_order' => 0],
            ['name' => 'Outside Dhaka', 'charge' => 130, 'sort_order' => 1],
        ];

        foreach ($shippingAreas as $area) {
            ShippingArea::query()->create([
                ...$area,
                'is_active' => true,
            ]);
        }

        $product = Product::query()->create([
            'name' => 'Classic Cotton T-Shirt',
            'slug' => 'classic-cotton-t-shirt',
            'sku' => 'TSHIRT-001',
            'short_description' => 'A soft, breathable everyday t-shirt.',
            'description' => 'Made from 100% premium cotton, this classic t-shirt is designed for all-day comfort. Machine washable and built to last.',
            'regular_price' => 1200,
            'sale_price' => 999,
            'track_stock' => true,
            'stock' => 0,
            'is_active' => true,
            'sort_order' => 0,
        ]);

        foreach ($sizes as $size) {
            $product->variants()->create([
                'size_id' => $size->id,
                'sku' => 'TSHIRT-001-'.strtoupper($size->slug),
                'stock' => 25,
                'is_active' => true,
            ]);
        }
    }

    private function seedSettings(): void
    {
        $defaults = [
            'site_name' => 'Ababil Store',
            'site_phone' => '+880 1XXXXXXXXX',
            'site_email' => 'hello@example.com',
            'currency' => 'BDT',
            'order_prefix' => 'ORD',
            'facebook_pixel_id' => null,
            'google_analytics_id' => null,
        ];

        foreach ($defaults as $key => $value) {
            Setting::query()->create(['key' => $key, 'value' => $value]);
        }
    }
}
