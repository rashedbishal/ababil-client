<?php

namespace App\Actions\Logos;

use App\Enums\LogoSlot;
use App\Models\Logo;
use Illuminate\Support\Facades\Storage;

/**
 * One-time import of the logo files that used to be hard-coded into the site
 * (the bundled brand mark and the icons in public/) into the logo CMS, so the
 * live site looks the same right after the CMS goes live. A slot that already
 * has a row is left alone, and a missing source file is skipped.
 */
class ImportBundledLogosAction
{
    /**
     * @return int how many logos were created
     */
    public function execute(?string $resourcesDirectory = null, ?string $publicDirectory = null): int
    {
        $resourcesDirectory ??= resource_path('images/landing');
        $publicDirectory ??= public_path();
        $created = 0;

        $brandMark = "{$resourcesDirectory}/ababil-logo.webp";

        foreach ([LogoSlot::Site, LogoSlot::Admin] as $slot) {
            if (! $this->exists($slot) && is_file($brandMark)) {
                $this->create($slot, $this->copy($brandMark, "logos/imported-{$slot->value}.webp"));
                $created++;
            }
        }

        $icons = [
            'icon_48' => "{$publicDirectory}/favicon-48x48.png",
            'icon_192' => "{$publicDirectory}/favicon-192x192.png",
            'apple' => "{$publicDirectory}/apple-touch-icon.png",
        ];

        if (! $this->exists(LogoSlot::Favicon) && collect($icons)->every(fn (string $file) => is_file($file))) {
            $variants = collect($icons)
                ->mapWithKeys(fn (string $file, string $name) => [$name => $this->copy($file, "logos/imported-favicon-{$name}.png")])
                ->all();
            $this->create(LogoSlot::Favicon, $variants['icon_192'], $variants);
            $created++;
        }

        return $created;
    }

    private function exists(LogoSlot $slot): bool
    {
        return Logo::query()->where('slot', $slot)->exists();
    }

    /**
     * @param  array<string, string>|null  $variants
     */
    private function create(LogoSlot $slot, string $path, ?array $variants = null): void
    {
        Logo::query()->create(['slot' => $slot, 'image_path' => $path, 'variants' => $variants]);
    }

    private function copy(string $source, string $path): string
    {
        Storage::disk(Logo::DISK)->put($path, (string) file_get_contents($source));

        return $path;
    }
}
