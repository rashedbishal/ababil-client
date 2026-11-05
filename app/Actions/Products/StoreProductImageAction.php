<?php

namespace App\Actions\Products;

use App\Models\Media;
use App\Models\ProductImage;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Stores an uploaded product photo (a WebP, validated by ProductImageRequest)
 * on the public disk and records it as a Media row.
 *
 * The storefront shows every product photo as a square. A photo that already
 * is exactly ProductImage::IMAGE_SIZE is stored untouched; anything else is
 * centre-cropped to a square and scaled to that size, so it can't break the
 * layout - at the cost of losing the edges (or some sharpness when it's
 * scaled up), which is why the admin page warns about it.
 */
class StoreProductImageAction
{
    private const QUALITY = 85;

    public function execute(UploadedFile $file, ?int $uploadedBy = null): Media
    {
        $contents = $file->get();

        if ($contents === false) {
            throw new RuntimeException('The uploaded file could not be read.');
        }

        return $this->store($contents, $file->getClientOriginalName(), $uploadedBy);
    }

    public function store(string $contents, string $originalFilename, ?int $uploadedBy = null): Media
    {
        $size = @getimagesizefromstring($contents);

        if ($size === false) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        if ($size[0] !== ProductImage::IMAGE_SIZE || $size[1] !== ProductImage::IMAGE_SIZE) {
            $contents = $this->convert($contents);
        }

        $filename = Str::uuid().'.webp';
        $path = 'products/'.$filename;
        Storage::disk(ProductImage::DISK)->put($path, $contents);

        return Media::query()->create([
            'disk' => ProductImage::DISK,
            'path' => $path,
            'filename' => $filename,
            'original_filename' => $originalFilename,
            'mime_type' => 'image/webp',
            'size' => strlen($contents),
            'uploaded_by' => $uploadedBy,
        ]);
    }

    private function convert(string $contents): string
    {
        if (! function_exists('imagewebp')) {
            throw new RuntimeException('The GD extension with WebP support is required to convert product images.');
        }

        $source = @imagecreatefromstring($contents);

        if (! $source instanceof GdImage) {
            throw new RuntimeException('The uploaded file could not be read as an image.');
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $side = min($width, $height);
        $target = ProductImage::IMAGE_SIZE;

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
