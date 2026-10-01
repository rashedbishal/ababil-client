<?php

namespace App\Support;

use GdImage;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Caps a stored raster image to a sane maximum dimension and re-compresses
 * it in place, using the GD extension directly (no new dependency - GD is
 * already available in this environment). Animated GIFs are left completely
 * untouched, since GD only reads/writes a single frame and re-saving one
 * would destroy the animation; PDFs and any other non-raster upload are
 * never passed through this at all. Any failure along the way leaves the
 * original file exactly as stored - this is a best-effort optimization,
 * never a reason to break an upload.
 */
class ImageOptimizer
{
    private const MAX_DIMENSION = 2000;

    /**
     * A ceiling on decoded pixel count, checked from the image header alone
     * (getimagesizefromstring() doesn't decode pixel data) before ever
     * calling imagecreatefromstring(). Without this, a small, highly
     * compressible file (e.g. a single-color PNG) can declare an enormous
     * width/height and blow up server memory on decode - a decompression
     * bomb. 50 million pixels comfortably covers even a 48MP camera photo
     * (~8000x6000) while bounding worst-case GD memory for the decode to
     * roughly 4 bytes/pixel (~200MB).
     */
    private const MAX_DECODE_PIXELS = 50_000_000;

    /**
     * @var list<string>
     */
    private const OPTIMIZABLE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    /**
     * @return int|null the new file size in bytes, or null if the file was left unchanged
     */
    public static function optimize(string $disk, string $path, ?string $mimeType): ?int
    {
        if (! in_array($mimeType, self::OPTIMIZABLE_MIME_TYPES, true)) {
            return null;
        }

        try {
            return self::resize($disk, $path, $mimeType);
        } catch (Throwable) {
            return null;
        }
    }

    private static function resize(string $disk, string $path, string $mimeType): ?int
    {
        $storage = Storage::disk($disk);
        $contents = $storage->get($path);

        if (! is_string($contents) || $contents === '') {
            return null;
        }

        $declaredSize = @getimagesizefromstring($contents);

        if (is_array($declaredSize) && $declaredSize[0] * $declaredSize[1] > self::MAX_DECODE_PIXELS) {
            return null;
        }

        $source = @imagecreatefromstring($contents);

        if (! $source instanceof GdImage) {
            return null;
        }

        if ($mimeType === 'image/jpeg') {
            // GD neither reads nor applies EXIF orientation, and imagejpeg()
            // doesn't carry EXIF through to the re-encoded output - without
            // this, any resized photo relying on its orientation tag (the
            // overwhelming majority of real phone-camera uploads, which is
            // exactly what this is meant to shrink) would silently come out
            // sideways or upside down once its tag is gone.
            //
            // Isolated in its own try/catch: if exif_read_data() isn't
            // available in this environment (the exif extension is optional,
            // unlike gd), the resize/recompress benefit below shouldn't be
            // lost entirely just because orientation correction couldn't run.
            try {
                $source = self::correctJpegOrientation($source, $contents);
            } catch (Throwable) {
                // Continue with $source unrotated.
            }
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $longestSide = max($width, $height);

        if ($longestSide <= self::MAX_DIMENSION) {
            imagedestroy($source);

            return null;
        }

        $scale = self::MAX_DIMENSION / $longestSide;
        $newWidth = max(1, (int) round($width * $scale));
        $newHeight = max(1, (int) round($height * $scale));

        self::preserveAlpha($source);

        $resized = imagescale($source, $newWidth, $newHeight);
        imagedestroy($source);

        if (! $resized instanceof GdImage) {
            return null;
        }

        self::preserveAlpha($resized);

        $encoded = self::encode($resized, $mimeType);
        imagedestroy($resized);

        if ($encoded === null) {
            return null;
        }

        // put() returns false (rather than throwing - disks default to
        // 'throw' => false) on a filesystem failure such as a full disk.
        // Reporting the optimized size back in that case would record a
        // Media.size that doesn't match what's actually on disk (the
        // original upload, since the write never happened).
        if (! $storage->put($path, $encoded)) {
            return null;
        }

        return strlen($encoded);
    }

    /**
     * Bakes the EXIF orientation tag into the pixels themselves (rotating
     * 90/180/270 degrees as needed) so the re-encoded output looks right
     * with no orientation metadata at all. Only handles the three rotations
     * real camera sensors actually produce (3, 6, 8) - the mirror-flip
     * variants (2, 4, 5, 7) are essentially never seen outside scanning
     * software and are left as a documented, low-risk gap.
     */
    private static function correctJpegOrientation(GdImage $image, string $contents): GdImage
    {
        $orientation = self::readExifOrientation($contents);

        $rotated = match ($orientation) {
            3 => imagerotate($image, 180, 0),
            6 => imagerotate($image, -90, 0),
            8 => imagerotate($image, 90, 0),
            default => false,
        };

        if (! $rotated instanceof GdImage) {
            return $image;
        }

        imagedestroy($image);

        return $rotated;
    }

    private static function readExifOrientation(string $contents): int
    {
        $stream = fopen('php://temp', 'r+');

        if ($stream === false) {
            return 1;
        }

        fwrite($stream, $contents);
        rewind($stream);

        $exif = @exif_read_data($stream, 'IFD0');
        fclose($stream);

        if (! is_array($exif) || ! isset($exif['Orientation'])) {
            return 1;
        }

        return (int) $exif['Orientation'];
    }

    /**
     * Keeps PNG/WebP transparency intact across the resize instead of it
     * flattening to a black or white background.
     */
    private static function preserveAlpha(GdImage $image): void
    {
        imagealphablending($image, false);
        imagesavealpha($image, true);
    }

    private static function encode(GdImage $image, string $mimeType): ?string
    {
        ob_start();

        $written = match ($mimeType) {
            'image/jpeg' => imagejpeg($image, null, 85),
            'image/png' => imagepng($image, null, 6),
            'image/webp' => imagewebp($image, null, 85),
            default => false,
        };

        $encoded = ob_get_clean();

        if (! $written || ! is_string($encoded) || $encoded === '') {
            return null;
        }

        return $encoded;
    }
}
