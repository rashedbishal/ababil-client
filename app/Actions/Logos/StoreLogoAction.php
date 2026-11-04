<?php

namespace App\Actions\Logos;

use App\Enums\LogoSlot;
use App\Models\Logo;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Stores an uploaded logo on the public disk, converting it when needed.
 *
 * Unlike gallery photos, a logo is never cropped: a logo that isn't square is
 * scaled to fit inside the square and padded with transparency, so none of it
 * is cut off (it just ends up smaller, with empty space around it).
 *
 *  - Site / Admin: a WebP that is already exactly LogoSlot::size() square is
 *    stored untouched; anything else becomes a square WebP of that size.
 *  - Favicon: always becomes three PNGs (48, 192 and a 180 px apple-touch icon
 *    on a white background, since iOS paints transparency black).
 */
class StoreLogoAction
{
    private const FAVICON_SIZES = ['icon_48' => 48, 'icon_192' => 192, 'apple' => 180];

    /**
     * @return array{image_path: string, variants: array<string, string>|null}
     */
    public function execute(UploadedFile $file, LogoSlot $slot): array
    {
        $contents = $file->get();

        if ($contents === false) {
            throw new RuntimeException('The uploaded file could not be read.');
        }

        return $slot === LogoSlot::Favicon
            ? $this->favicon($contents)
            : $this->single($contents, $slot->size());
    }

    /**
     * Stores any square logo-style image (partner logos use this too): kept
     * as is when it's already an exact-size WebP, otherwise fitted inside a
     * transparent square of that size and saved as WebP. Returns the path.
     *
     * @param  int<1, max>  $size
     */
    public function storeSquare(UploadedFile $file, int $size, string $directory = 'logos', string $prefix = 'logo'): string
    {
        $contents = $file->get();

        if ($contents === false) {
            throw new RuntimeException('The uploaded file could not be read.');
        }

        return $this->single($contents, $size, $directory, $prefix)['image_path'];
    }

    /**
     * @param  int<1, max>  $size
     * @return array{image_path: string, variants: null}
     */
    private function single(string $contents, int $size, string $directory = 'logos', string $prefix = 'logo'): array
    {
        $info = @getimagesizefromstring($contents);

        if ($info === false) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        if ($info[2] === IMAGETYPE_WEBP && $info[0] === $size && $info[1] === $size) {
            $webp = $contents;
        } else {
            $webp = $this->encode(fn () => imagewebp($this->fit($this->decode($contents), $size), null, 92));
        }

        return ['image_path' => $this->put($webp, 'webp', $prefix, $directory), 'variants' => null];
    }

    /**
     * @return array{image_path: string, variants: array<string, string>}
     */
    private function favicon(string $contents): array
    {
        $source = $this->decode($contents);
        $variants = [];

        foreach (self::FAVICON_SIZES as $name => $size) {
            $background = $name === 'apple' ? [255, 255, 255] : null;
            $png = $this->encode(fn () => imagepng($this->fit($source, $size, $background), null, 9));
            $variants[$name] = $this->put($png, 'png', "favicon-{$name}");
        }

        return ['image_path' => $variants['icon_192'], 'variants' => $variants];
    }

    private function decode(string $contents): GdImage
    {
        $image = @imagecreatefromstring($contents);

        if (! $image instanceof GdImage) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        return $image;
    }

    /**
     * Scales $source to fit inside a $size square (never cropping) and centres
     * it on a transparent - or, with $background, solid - canvas.
     *
     * @param  int<1, max>  $size
     * @param  array{int<0, 255>, int<0, 255>, int<0, 255>}|null  $background
     */
    private function fit(GdImage $source, int $size, ?array $background = null): GdImage
    {
        $width = imagesx($source);
        $height = imagesy($source);
        $scale = $size / max($width, $height);
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));

        $canvas = imagecreatetruecolor($size, $size);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, (int) ($background === null
            ? imagecolorallocatealpha($canvas, 255, 255, 255, 127)
            : imagecolorallocate($canvas, ...$background)));
        imagecopyresampled(
            $canvas, $source,
            intdiv($size - $targetWidth, 2), intdiv($size - $targetHeight, 2), 0, 0,
            $targetWidth, $targetHeight, $width, $height,
        );

        return $canvas;
    }

    /**
     * Runs a GD encoder that writes to the output buffer and returns the bytes.
     *
     * @param  callable(): bool  $encoder
     */
    private function encode(callable $encoder): string
    {
        ob_start();
        $encoded = $encoder();
        $bytes = (string) ob_get_clean();

        if (! $encoded || $bytes === '') {
            throw new RuntimeException('The uploaded image could not be converted.');
        }

        return $bytes;
    }

    private function put(string $contents, string $extension, string $prefix = 'logo', string $directory = 'logos'): string
    {
        $path = $directory.'/'.$prefix.'-'.Str::uuid().'.'.$extension;
        Storage::disk(Logo::DISK)->put($path, $contents);

        return $path;
    }
}
