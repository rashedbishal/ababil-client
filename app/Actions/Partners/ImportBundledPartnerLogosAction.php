<?php

namespace App\Actions\Partners;

use App\Models\PartnerLogo;
use Illuminate\Support\Facades\Storage;

/**
 * One-time import of the certification logos that used to be hard-coded into
 * the storefront (resources/images/landing/certifications) into the partner
 * logo CMS, so the live page looks the same right after the CMS goes live.
 * Does nothing if there are already any partner logos, and skips any source
 * file that's missing, so it's safe to run more than once.
 */
class ImportBundledPartnerLogosAction
{
    /**
     * @var list<array{file: string, label: string}>
     */
    private const ITEMS = [
        ['file' => 'gmp', 'label' => 'GMP Certified'],
        ['file' => 'bcsir', 'label' => 'BCSIR Tested'],
        ['file' => 'usac', 'label' => 'USAC Accredited'],
        ['file' => 'ukas', 'label' => 'UKAS Accredited'],
        ['file' => 'iso-9001', 'label' => 'ISO 9001:2015 Certified'],
    ];

    /**
     * @return int how many partner logos were created
     */
    public function execute(?string $sourceDirectory = null): int
    {
        if (PartnerLogo::query()->exists()) {
            return 0;
        }

        $sourceDirectory ??= resource_path('images/landing/certifications');
        $disk = Storage::disk(PartnerLogo::DISK);
        $sortOrder = 0;

        foreach (self::ITEMS as $item) {
            $source = "{$sourceDirectory}/{$item['file']}.webp";

            if (! is_file($source)) {
                continue;
            }

            $path = "partners/imported-{$item['file']}.webp";
            $disk->put($path, (string) file_get_contents($source));

            PartnerLogo::query()->create([
                'image_path' => $path,
                'label' => $item['label'],
                'sort_order' => $sortOrder++,
                'is_active' => true,
            ]);
        }

        return $sortOrder;
    }
}
