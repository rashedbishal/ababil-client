<?php

namespace Database\Seeders;

use App\Models\Media;
use App\Models\Product;
use App\Models\Setting;
use App\Models\ShippingArea;
use App\Models\Size;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
            // The seeded admin is the one and only mother admin - other
            // admins are created afterwards through the admin management UI.
            // Real environments should replace these credentials with
            // `php artisan ababil:mother-admin` instead of editing this seeder.
            'is_mother_admin' => true,
        ]);

        $this->seedSettings();

        collect(['S', 'M', 'L', 'XL', 'XXL'])
            ->each(fn (string $name, int $index) => Size::query()->create([
                'name' => $name,
                'slug' => strtolower($name),
                'sort_order' => $index,
                'is_active' => true,
            ]));

        $shippingAreas = [
            ['name' => 'Inside Dhaka City Corporation', 'charge' => 70, 'sort_order' => 0],
            ['name' => 'Outside Dhaka City Corporation', 'charge' => 110, 'sort_order' => 1],
        ];

        foreach ($shippingAreas as $area) {
            ShippingArea::query()->create([
                ...$area,
                'is_active' => true,
            ]);
        }

        Product::query()->create([
            'name' => 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল',
            'slug' => 'ababil-organic-pain-relief-oil',
            'sku' => 'ABABIL-OIL-200',
            'short_description' => 'হাঁটু, ঘাড়, পিঠ ও কোমরের ব্যথায় দ্রুত আরামের জন্য প্রাকৃতিক পেইন রিলিফ অয়েল।',
            'description' => 'বোসওয়েলিয়া, আর্নিকা, টি ট্রি, ইউক্যালিপটাস, ভিটামিন-ই সহ ৯টি বিশ্বমানের প্রাকৃতিক উপাদানের অনন্য সংমিশ্রণে তৈরি আবাবিল অর্গানিক পেইন রিলিফ অয়েল দ্রুত শোষিত হয়, কোনো আঠালো ভাব রাখে না এবং আলাদা করে গরম করার প্রয়োজন হয় না। ২০০ মি.লি. বোতল।',
            'regular_price' => 1150,
            'sale_price' => 790,
            'featured_image_id' => $this->seedProductImage(),
            'track_stock' => true,
            'stock' => 250,
            'is_active' => true,
            'sort_order' => 0,
        ]);
    }

    private function seedProductImage(): ?int
    {
        $source = database_path('seeders/assets/ababil-oil-product.jpg');

        if (! is_file($source)) {
            return null;
        }

        $contents = file_get_contents($source);

        if ($contents === false) {
            return null;
        }

        $filename = Str::uuid().'.jpg';
        $path = 'products/'.$filename;

        Storage::disk('public')->put($path, $contents);

        return Media::query()->create([
            'disk' => 'public',
            'path' => $path,
            'filename' => $filename,
            'original_filename' => 'ababil-oil-product.jpg',
            'mime_type' => 'image/jpeg',
            'size' => Storage::disk('public')->size($path),
        ])->id;
    }

    private function seedSettings(): void
    {
        $defaults = [
            'site_name' => 'Ababil',
            'site_phone' => '+880 1711-113039',
            'site_email' => 'hello@ababilofficial.com',
            'currency' => 'BDT',
            'order_prefix' => 'ORD',
            'facebook_pixel_id' => null,
            'google_analytics_id' => null,
            'whatsapp_number' => '+8801633331333',
            'facebook_page_url' => 'https://www.facebook.com/AbabilPainReliefOil',
        ];

        foreach ($defaults as $key => $value) {
            Setting::query()->create(['key' => $key, 'value' => $value]);
        }
    }
}
