<?php

namespace App\Enums;

/**
 * The three photo galleries on the storefront. The heading and subtitle of
 * each are fixed copy (not editable in the CMS) and must match what
 * `resources/js/pages/concept-3.tsx` and `Concept3RoutineSection` render.
 */
enum GallerySection: string
{
    case Features = 'features';
    case Routine = 'routine';
    case Campaign = 'campaign';

    public function title(): string
    {
        return match ($this) {
            self::Features => 'সবার স্বস্তি, সবার যত্ন',
            self::Routine => 'কাঁধ থেকে পায়ের তলা',
            self::Campaign => 'চেনা জীবনের যত্ন',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Features => 'নিজের ও প্রিয়জনের প্রতিদিনের ব্যথা দূর করতে ভরসা থাকুক— আবাবিল পেইন রিলিফ অয়েল।',
            self::Routine => 'কাঁধ, পিঠ, কোমর, হাঁটু কিংবা পা — ব্যথা যেখানেই, আবাবিল সেখানেই।',
            self::Campaign => 'আপনজনের ব্যথা কমুক, ফিরুক চেনা হাসি।',
        };
    }

    /**
     * Where the section sits on the storefront, in plain English, for the
     * admin page.
     */
    public function placement(): string
    {
        return match ($this) {
            self::Features => 'Photo grid below the delivery map. Tapping a photo opens the order form.',
            self::Routine => 'Dark section below the first photo grid. Photos only - tapping does nothing.',
            self::Campaign => 'Photo grid below the dark section. Tapping a photo opens the order form.',
        };
    }

    /**
     * Whether tapping a photo on the storefront opens the order form (the
     * "অর্ডার করুন" pill on each card).
     */
    public function hasOrderButton(): bool
    {
        return $this !== self::Routine;
    }
}
