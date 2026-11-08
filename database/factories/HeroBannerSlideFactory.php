<?php

namespace Database\Factories;

use App\Models\HeroBannerSlide;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HeroBannerSlide>
 */
class HeroBannerSlideFactory extends Factory
{
    protected $model = HeroBannerSlide::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'alt' => 'Hero banner slide',
            'desktop_image_path' => null,
            'tab_image_path' => null,
            'mobile_image_path' => null,
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
