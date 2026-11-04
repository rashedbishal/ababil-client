<?php

namespace App\Actions\Gallery;

use App\Models\GalleryItem;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Stores an uploaded gallery photo (a WebP, validated by GalleryItemRequest)
 * on the public disk and returns its path relative to the disk.
 *
 * The storefront shows every photo as a GalleryItem::IMAGE_SIZE square. A
 * photo that already is exactly that size is stored untouched; anything else
 * is centre-cropped to a square and scaled to that size, so it can't break
 * the layout - at the cost of losing the edges (or some sharpness when it's
 * scaled up), which is why the admin page warns about it.
 */
class StoreGalleryImageAction
{
    private const QUALITY = 85;

    public function execute(UploadedFile $file): string
    {
        $contents = $file->get();

        if ($contents === false) {
            throw new RuntimeException('The uploaded file could not be read.');
        }

        $size = @getimagesizefromstring($contents);

        if ($size === false) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        if ($size[0] !== GalleryItem::IMAGE_SIZE || $size[1] !== GalleryItem::IMAGE_SIZE) {
            $contents = $this->convert($contents);
        }

        $path = 'gallery/'.Str::uuid().'.webp';
        Storage::disk(GalleryItem::DISK)->put($path, $contents);

        return $path;
    }

    private function convert(string $contents): string
    {
        if (! function_exists('imagewebp')) {
            throw new RuntimeException('The GD extension with WebP support is required to convert gallery images.');
        }

        $source = @imagecreatefromstring($contents);

        if (! $source instanceof GdImage) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $side = min($width, $height);
        $target = GalleryItem::IMAGE_SIZE;

        $image = imagecreatetruecolor($target, $target);
        imagealphablending($image, false);
        imagesavealpha($image, true);
        imagefill($image, 0, 0, (int) imagecolorallocatealpha($image, 255, 255, 255, 127));
        imagecopyresampled(
            $image, $source,
            0, 0, intdiv($width - $side, 2), intdiv($height - $side, 2),
            $target, $target, $side, $side,
        );

        ob_start();
        $encoded = imagewebp($image, null, self::QUALITY);
        $webp = (string) ob_get_clean();

        if (! $encoded || $webp === '') {
            throw new RuntimeException('The uploaded image could not be converted.');
        }

        return $webp;
    }
}
