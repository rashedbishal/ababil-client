<?php

namespace App\Actions\Gallery;

use App\Enums\GallerySection;
use App\Models\GalleryItem;
use Illuminate\Support\Facades\Storage;

/**
 * One-time import of the photos that used to be hard-coded into the
 * storefront (resources/images/landing/cards) into the gallery CMS, so the
 * live page looks the same right after the CMS goes live. Does nothing if
 * the gallery already has any rows, and skips any source file that's missing,
 * so it's safe to run more than once.
 */
class ImportBundledGalleryAction
{
    /**
     * @var array<string, list<array{file: string, caption: string, alt: string}>>
     */
    private const ITEMS = [
        'features' => [
            ['file' => 'usp-herbal-original', 'caption' => 'সংসারের সবার ভরসা', 'alt' => 'আবাবিল অয়েল হাতে হাসিমুখে একজন মা'],
            ['file' => 'care-knee-bazaar', 'caption' => 'ব্যথাকে পিছনে ফেলে এগিয়ে চলুন', 'alt' => 'রাস্তায় হাসিমুখে থাম্বস আপ দেখিয়ে দৌড়াচ্ছেন একজন পুরুষ'],
            ['file' => 'care-foot-walk', 'caption' => 'সারাদিন হাঁটার পর পায়ে আরাম', 'alt' => 'সারাদিন হাঁটার পর পায়ের গোড়ালিতে ব্যথা'],
            ['file' => 'problem-back', 'caption' => 'পিঠের খবর নিন নিজেই', 'alt' => 'অফিস চেয়ারে বসে নিজের পিঠে হাত রেখেছেন একজন যুবক'],
            ['file' => 'care-neck-warmth', 'caption' => 'ঘাড়ে লাগাতেই আরামের উষ্ণতা', 'alt' => 'ঘাড়ের ব্যথায় হাত রেখেছেন একজন যুবক'],
            ['file' => 'usp-warming-original', 'caption' => 'ব্যাগের ভারে কাঁধ ব্যথায় আরাম', 'alt' => 'স্কুলব্যাগ কাঁধে হাসিমুখে এক শিশু'],
        ],
        'routine' => [
            ['file' => 'routine-shoulder-shop', 'caption' => 'সারাদিনের কাজে কাঁধে ব্যথা', 'alt' => 'দোকান বন্ধের পর কাঁধে হাত রেখে বিশ্রাম নিচ্ছেন একজন দোকানি'],
            ['file' => 'routine-back-stairs', 'caption' => 'সিঁড়ি বেয়ে ওঠায় পিঠে ব্যথা', 'alt' => 'সিঁড়ি ভাঙতে পিঠ-কোমরে ব্যথা পাচ্ছেন একজন বয়স্ক মানুষ'],
            ['file' => 'routine-waist-chores', 'caption' => 'ভারী কাজের পর কোমরে টান', 'alt' => 'ভারী বালতি নামিয়ে কোমরে হাত রেখেছেন একজন নারী'],
            ['file' => 'problem-knee', 'caption' => 'হাঁটু ভাঁজে কষ্ট', 'alt' => 'হাঁটু ভাঁজ করতে ব্যথায় কষ্ট পাচ্ছেন একজন যুবক'],
            ['file' => 'routine-knee-stairs', 'caption' => 'ব্যথার বিরুদ্ধে একাই ১০০', 'alt' => 'জয়েন্ট ও পিঠের ব্যথার দানবের বিরুদ্ধে লড়ছেন আবাবিল যোদ্ধা'],
            ['file' => 'routine-foot-sole', 'caption' => 'পায়ের তলার ব্যথা', 'alt' => 'পায়ের তলার ব্যথা'],
        ],
        'campaign' => [
            ['file' => 'campaign-grandpa-grandson', 'caption' => 'লাঠি নয়, নাতির হাত ধরে দাদু', 'alt' => 'লাঠি ছাড়াই নাতির হাত ধরে হাঁটছেন দাদু'],
            ['file' => 'problem-neck', 'caption' => 'মায়ের কাঁধেও একটু যত্ন', 'alt' => 'মায়ের কাঁধে মেয়ের যত্নের হাত'],
            ['file' => 'campaign-father-shoulders', 'caption' => 'বাবার কাঁধেই সন্তানের আশ্রয়', 'alt' => 'বাবার কাঁধে চড়ে আনন্দে দুই হাত মেলে দিয়েছে সন্তান'],
            ['file' => 'campaign-son-father', 'caption' => 'মা-বাবার জন্য সেরা উপহার', 'alt' => 'বৃদ্ধ বাবার কাঁধে হাত রেখে পাশে দাঁড়িয়ে ছেলে'],
            ['file' => 'problem-feet', 'caption' => 'নামাজে স্বস্তি, সিজদায় আরাম', 'alt' => 'জায়নামাজে সিজদারত একজন মুসল্লি'],
            ['file' => 'campaign-neck-kitchen', 'caption' => 'রান্নাঘরেও ঘাড় থাকুক আরামে', 'alt' => 'রান্নার ফাঁকে ঘাড়ে হাত রেখেছেন একজন গৃহিণী'],
        ],
    ];

    /**
     * @return int how many gallery items were created
     */
    public function execute(?string $sourceDirectory = null): int
    {
        if (GalleryItem::query()->exists()) {
            return 0;
        }

        $sourceDirectory ??= resource_path('images/landing/cards');
        $disk = Storage::disk(GalleryItem::DISK);
        $created = 0;

        foreach (self::ITEMS as $section => $items) {
            $sortOrder = 0;

            foreach ($items as $item) {
                $source = "{$sourceDirectory}/{$item['file']}.webp";

                if (! is_file($source)) {
                    continue;
                }

                $path = "gallery/imported-{$item['file']}.webp";
                $disk->put($path, (string) file_get_contents($source));

                GalleryItem::query()->create([
                    'section' => GallerySection::from($section),
                    'image_path' => $path,
                    'alt' => $item['alt'],
                    'caption' => $item['caption'],
                    'sort_order' => $sortOrder++,
                    'is_active' => true,
                ]);
                $created++;
            }
        }

        return $created;
    }
}
