<?php

namespace App\Actions\HeroBanner;

use App\Models\HeroBannerSlide;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class StoreHeroBannerImageAction
{
    public function execute(UploadedFile $file, string $variant): string
    {
        $contents = $file->get();

        if ($contents === false) {
            throw new RuntimeException('The uploaded file could not be read.');
        }

        $path = 'hero-banner/'.Str::uuid().'-'.$variant.'.webp';
        Storage::disk(HeroBannerSlide::DISK)->put($path, $contents);

        return $path;
    }
}
