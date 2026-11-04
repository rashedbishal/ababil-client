<?php

namespace App\Actions\Gallery;

use App\Models\GalleryItem;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Turns an uploaded gallery photo into a resized WebP on the public disk, so
 * a multi-megabyte phone photo can't slow the storefront down. Returns the
 * stored path (relative to the disk).
 */
class StoreGalleryImageAction
{
    /** Longest edge, in pixels, of the stored image. */
    private const MAX_EDGE = 1200;

    private const QUALITY = 82;

    public function execute(UploadedFile $file): string
    {
        if (! function_exists('imagewebp')) {
            throw new RuntimeException('The GD extension with WebP support is required to store gallery images.');
        }

        $contents = $file->get();
        $source = $contents === false ? false : @imagecreatefromstring($contents);

        if (! $source instanceof GdImage) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        $source = $this->applyExifOrientation($source, $contents);
        $image = $this->fit($source);

        ob_start();
        $encoded = imagewebp($image, null, self::QUALITY);
        $webp = (string) ob_get_clean();

        if (! $encoded || $webp === '') {
            throw new RuntimeException('The uploaded image could not be converted.');
        }

        $path = 'gallery/'.Str::uuid().'.webp';
        Storage::disk(GalleryItem::DISK)->put($path, $webp);

        return $path;
    }

    /**
     * Phone photos are often stored sideways with an EXIF rotation flag that
     * GD ignores, which would show them rotated on the storefront.
     */
    private function applyExifOrientation(GdImage $image, string $contents): GdImage
    {
        if (! function_exists('exif_read_data') || ! str_starts_with($contents, "\xFF\xD8")) {
            return $image;
        }

        $stream = fopen('php://memory', 'r+');

        if ($stream === false) {
            return $image;
        }

        fwrite($stream, $contents);
        rewind($stream);
        $exif = @exif_read_data($stream);
        fclose($stream);

        $angle = match (is_array($exif) ? ($exif['Orientation'] ?? 1) : 1) {
            3 => 180,
            6 => -90,
            8 => 90,
            default => 0,
        };

        if ($angle === 0) {
            return $image;
        }

        return imagerotate($image, $angle, 0) ?: $image;
    }

    private function fit(GdImage $source): GdImage
    {
        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, self::MAX_EDGE / max($width, $height));

        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));

        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagefill($target, 0, 0, (int) imagecolorallocatealpha($target, 255, 255, 255, 127));
        imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        return $target;
    }
}
