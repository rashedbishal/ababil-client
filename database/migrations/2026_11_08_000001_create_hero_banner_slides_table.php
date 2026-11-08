<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hero_banner_slides', function (Blueprint $table): void {
            $table->id();
            $table->string('desktop_image_path')->nullable();
            $table->string('tab_image_path')->nullable();
            $table->string('mobile_image_path')->nullable();
            $table->string('alt');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $publicHeroDir = public_path('images/hero');
        $uploadDir = Storage::disk('public')->path('hero-banner');

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $slides = [
            [
                'id' => 1,
                'desktop' => 'IMG_3616_desktop.webp',
                'tab' => '001_tab.webp',
                'mobile' => '001_mobile.webp',
                'alt' => 'বয়স বাড়লেও গতি রবে — আবাবিল অয়েল',
            ],
            [
                'id' => 2,
                'desktop' => 'IMG_3614_desktop.webp',
                'tab' => '002_tab.webp',
                'mobile' => '002_mobile.webp',
                'alt' => 'সচল পায়ে এগিয়ে চলুন — আবাবিল অয়েল',
            ],
            [
                'id' => 3,
                'desktop' => 'IMG_3615_desktop.webp',
                'tab' => '003_tab.webp',
                'mobile' => '003_mobile.webp',
                'alt' => 'শতবর্ষের ভেষজ রত্ন — আবাবিল অয়েল',
            ],
            [
                'id' => 4,
                'desktop' => 'IMG_3612_desktop.webp',
                'tab' => '3612_tab.webp',
                'mobile' => '3612_mobile.webp',
                'alt' => 'স্বস্তিতে বাঁচুক শরীর-মন — আবাবিল অয়েল',
            ],
            [
                'id' => 5,
                'desktop' => 'IMG_3613_desktop.webp',
                'tab' => '3613_tab.webp',
                'mobile' => '3613_mobile.webp',
                'alt' => 'ঘুম হোক শান্তির — আবাবিল অয়েল',
            ],
        ];

        foreach ($slides as $index => $slide) {
            $values = ['alt' => $slide['alt'], 'sort_order' => $index, 'is_active' => true];

            foreach (['desktop', 'tab', 'mobile'] as $variant) {
                $sourceName = $slide[$variant];
                $sourcePath = $publicHeroDir.'/'.$sourceName;

                if (! is_file($sourcePath)) {
                    continue;
                }

                $destinationPath = 'hero-banner/'.$sourceName;
                copy($sourcePath, Storage::disk('public')->path($destinationPath));
                $values["{$variant}_image_path"] = $destinationPath;
            }

            DB::table('hero_banner_slides')->insert($values);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hero_banner_slides');
    }
};
