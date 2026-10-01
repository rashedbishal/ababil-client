<?php

use App\Support\ImageOptimizer;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

/**
 * Builds a minimal, valid EXIF APP1 segment carrying only an Orientation
 * tag, and splices it right after a real JPEG's SOI marker. GD can't write
 * EXIF itself, so this is the only way to produce a fixture that actually
 * exercises exif_read_data() the way a real phone-camera photo would.
 */
function jpegWithOrientationTag(string $jpegBytes, int $orientation): string
{
    $tiff = 'II'.pack('v', 0x2A).pack('V', 8);
    $ifdCount = pack('v', 1);
    $entry = pack('v', 0x0112).pack('v', 3).pack('V', 1).pack('v', $orientation).pack('v', 0);
    $nextIfdOffset = pack('V', 0);
    $tiffData = $tiff.$ifdCount.$entry.$nextIfdOffset;

    $app1Data = "Exif\0\0".$tiffData;
    $app1Segment = "\xFF\xE1".pack('n', strlen($app1Data) + 2).$app1Data;

    return substr($jpegBytes, 0, 2).$app1Segment.substr($jpegBytes, 2);
}

function putGeneratedImage(string $path, int $width, int $height, string $mimeType, bool $withTransparency = false): string
{
    Storage::fake('public');

    $image = imagecreatetruecolor($width, $height);

    if ($withTransparency) {
        imagesavealpha($image, true);
        $transparent = imagecolorallocatealpha($image, 0, 0, 0, 127);
        imagefill($image, 0, 0, $transparent);
        $opaque = imagecolorallocatealpha($image, 255, 0, 0, 0);
        imagefilledrectangle($image, 0, 0, intdiv($width, 2), $height, $opaque);
    } else {
        $color = imagecolorallocate($image, 120, 60, 200);
        imagefill($image, 0, 0, $color);
    }

    ob_start();

    match ($mimeType) {
        'image/jpeg' => imagejpeg($image, null, 95),
        'image/png' => imagepng($image),
        'image/webp' => imagewebp($image),
        'image/gif' => imagegif($image),
    };

    $bytes = ob_get_clean();
    imagedestroy($image);

    Storage::disk('public')->put($path, $bytes);

    return $bytes;
}

test('a large jpeg is resized down to the maximum dimension', function () {
    $original = putGeneratedImage('media/large.jpg', 3000, 2000, 'image/jpeg');

    $newSize = ImageOptimizer::optimize('public', 'media/large.jpg', 'image/jpeg');

    expect($newSize)->not->toBeNull();

    $resized = imagecreatefromstring(Storage::disk('public')->get('media/large.jpg'));
    expect(imagesx($resized))->toBe(2000)
        ->and(imagesy($resized))->toBeLessThanOrEqual(1334);
});

test('an image already within the maximum dimension is left untouched', function () {
    $original = putGeneratedImage('media/small.jpg', 400, 300, 'image/jpeg');

    $newSize = ImageOptimizer::optimize('public', 'media/small.jpg', 'image/jpeg');

    expect($newSize)->toBeNull();
    expect(Storage::disk('public')->get('media/small.jpg'))->toBe($original);
});

test('png transparency survives the resize', function () {
    putGeneratedImage('media/transparent.png', 3000, 100, 'image/png', withTransparency: true);

    ImageOptimizer::optimize('public', 'media/transparent.png', 'image/png');

    $resized = imagecreatefromstring(Storage::disk('public')->get('media/transparent.png'));
    imagesavealpha($resized, true);
    $pixel = imagecolorat($resized, imagesx($resized) - 1, 0);
    $alpha = ($pixel >> 24) & 0x7F;

    expect($alpha)->toBe(127);
});

test('an animated gif is left completely untouched', function () {
    $original = putGeneratedImage('media/anim.gif', 3000, 2000, 'image/gif');

    $newSize = ImageOptimizer::optimize('public', 'media/anim.gif', 'image/gif');

    expect($newSize)->toBeNull();
    expect(Storage::disk('public')->get('media/anim.gif'))->toBe($original);
});

test('a non-image file is never touched', function () {
    Storage::fake('public');
    Storage::disk('public')->put('media/doc.pdf', '%PDF-1.4 fake pdf contents');

    $newSize = ImageOptimizer::optimize('public', 'media/doc.pdf', 'application/pdf');

    expect($newSize)->toBeNull();
    expect(Storage::disk('public')->get('media/doc.pdf'))->toBe('%PDF-1.4 fake pdf contents');
});

test('corrupt image data fails open and leaves the file untouched', function () {
    Storage::fake('public');
    Storage::disk('public')->put('media/corrupt.jpg', 'not-actually-an-image');

    $newSize = ImageOptimizer::optimize('public', 'media/corrupt.jpg', 'image/jpeg');

    expect($newSize)->toBeNull();
    expect(Storage::disk('public')->get('media/corrupt.jpg'))->toBe('not-actually-an-image');
});

test('a 180-degree EXIF orientation flips the image rather than just leaving dimensions unchanged', function () {
    Storage::fake('public');

    // A 180-degree rotation doesn't change width/height at all, so this
    // specifically checks pixel positions flip (top <-> bottom) rather than
    // a dimension comparison, which would pass even if correction were
    // completely broken for this orientation value.
    $image = imagecreatetruecolor(3000, 1000);
    imagefilledrectangle($image, 0, 0, 2999, 499, imagecolorallocate($image, 220, 20, 20));
    imagefilledrectangle($image, 0, 500, 2999, 999, imagecolorallocate($image, 20, 20, 220));
    ob_start();
    imagejpeg($image, null, 95);
    $plainJpeg = ob_get_clean();
    imagedestroy($image);

    Storage::disk('public')->put('media/upside-down.jpg', jpegWithOrientationTag($plainJpeg, 3));

    ImageOptimizer::optimize('public', 'media/upside-down.jpg', 'image/jpeg');

    $result = imagecreatefromstring(Storage::disk('public')->get('media/upside-down.jpg'));
    $width = imagesx($result);
    $height = imagesy($result);
    $top = imagecolorsforindex($result, imagecolorat($result, intdiv($width, 2), 2));
    $bottom = imagecolorsforindex($result, imagecolorat($result, intdiv($width, 2), $height - 2));

    expect($top['blue'])->toBeGreaterThan($top['red'])
        ->and($bottom['red'])->toBeGreaterThan($bottom['blue']);
});

test('a tiny file declaring an enormous pixel size is rejected before decoding', function () {
    Storage::fake('public');

    // A minimal, valid PNG IHDR chunk declaring 40000x40000 with no actual
    // pixel data behind it - getimagesizefromstring() reads this from the
    // header alone, which is exactly what the guard checks before ever
    // calling the expensive imagecreatefromstring().
    $chunk = function (string $type, string $data): string {
        return pack('N', strlen($data)).$type.$data.pack('N', crc32($type.$data));
    };
    $ihdrData = pack('NN', 40000, 40000).chr(8).chr(2).chr(0).chr(0).chr(0);
    $fakeHugePng = "\x89PNG\r\n\x1a\n".$chunk('IHDR', $ihdrData);

    Storage::disk('public')->put('media/bomb.png', $fakeHugePng);

    $newSize = ImageOptimizer::optimize('public', 'media/bomb.png', 'image/png');

    expect($newSize)->toBeNull();
    expect(Storage::disk('public')->get('media/bomb.png'))->toBe($fakeHugePng);
});

test('a wide photo tagged exif orientation 6 is rotated upright before resizing, not left sideways', function () {
    Storage::fake('public');

    // A wide (3000x200) image, left half red, right half blue. Orientation
    // 6 means "rotate 90 CW to display correctly" - a real phone holds this
    // convention for a photo actually shot in portrait. After correction,
    // the longest side becomes the (now-rotated) height, red ends up near
    // the top and blue near the bottom.
    $image = imagecreatetruecolor(3000, 200);
    imagefilledrectangle($image, 0, 0, 1499, 199, imagecolorallocate($image, 220, 20, 20));
    imagefilledrectangle($image, 1500, 0, 2999, 199, imagecolorallocate($image, 20, 20, 220));
    ob_start();
    imagejpeg($image, null, 95);
    $plainJpeg = ob_get_clean();
    imagedestroy($image);

    Storage::disk('public')->put('media/sideways.jpg', jpegWithOrientationTag($plainJpeg, 6));

    ImageOptimizer::optimize('public', 'media/sideways.jpg', 'image/jpeg');

    $result = imagecreatefromstring(Storage::disk('public')->get('media/sideways.jpg'));

    expect(imagesx($result))->toBeLessThan(imagesy($result));

    $width = imagesx($result);
    $height = imagesy($result);
    $top = imagecolorsforindex($result, imagecolorat($result, intdiv($width, 2), 5));
    $bottom = imagecolorsforindex($result, imagecolorat($result, intdiv($width, 2), $height - 5));

    expect($top['red'])->toBeGreaterThan($top['blue'])
        ->and($bottom['blue'])->toBeGreaterThan($bottom['red']);
});

test('an image with no exif orientation tag resizes without any rotation', function () {
    Storage::fake('public');

    $image = imagecreatetruecolor(3000, 200);
    imagefill($image, 0, 0, imagecolorallocate($image, 100, 100, 100));
    ob_start();
    imagejpeg($image, null, 90);
    $jpeg = ob_get_clean();
    imagedestroy($image);

    Storage::disk('public')->put('media/untagged.jpg', $jpeg);

    ImageOptimizer::optimize('public', 'media/untagged.jpg', 'image/jpeg');

    $result = imagecreatefromstring(Storage::disk('public')->get('media/untagged.jpg'));

    expect(imagesx($result))->toBeGreaterThan(imagesy($result));
});

test('a filesystem write failure during optimization does not report a mismatched file size', function () {
    $image = imagecreatetruecolor(3000, 2000);
    imagefill($image, 0, 0, imagecolorallocate($image, 10, 20, 30));
    ob_start();
    imagejpeg($image, null, 95);
    $bytes = ob_get_clean();
    imagedestroy($image);

    // Local disks default to 'throw' => false, so a write failure (e.g. a
    // full disk) surfaces as put() returning false, not an exception -
    // optimize() must check for that rather than blindly trusting the write
    // succeeded.
    $disk = Mockery::mock(Filesystem::class);
    $disk->shouldReceive('get')->once()->with('media/fails.jpg')->andReturn($bytes);
    $disk->shouldReceive('put')->once()->andReturn(false);
    Storage::shouldReceive('disk')->with('public')->andReturn($disk);

    $newSize = ImageOptimizer::optimize('public', 'media/fails.jpg', 'image/jpeg');

    expect($newSize)->toBeNull();
});
