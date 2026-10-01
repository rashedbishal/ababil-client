<?php

use App\Models\Media;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('an admin can upload a media file', function () {
    Storage::fake('public');
    $this->actingAsAdmin();

    $response = $this->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->image('product.jpg'),
    ]);

    $response->assertRedirect();
    expect(Media::query()->count())->toBe(1);
});

test('uploading an oversized image stores it resized and reports the smaller size', function () {
    Storage::fake('public');
    $this->actingAsAdmin();

    $image = imagecreatetruecolor(3000, 2000);
    imagefill($image, 0, 0, imagecolorallocate($image, 10, 20, 30));
    $path = tempnam(sys_get_temp_dir(), 'media').'.jpg';
    imagejpeg($image, $path, 95);
    imagedestroy($image);
    $originalSize = filesize($path);

    $this->post(route('admin.media.store'), [
        'file' => new UploadedFile($path, 'large.jpg', 'image/jpeg', null, true),
    ]);

    $media = Media::query()->first();
    expect($media)->not->toBeNull()
        ->and($media->size)->toBeLessThan($originalSize);

    $stored = imagecreatefromstring(Storage::disk('public')->get($media->path));
    expect(imagesx($stored))->toBe(2000);

    @unlink($path);
});

test('uploading a disallowed file type is rejected', function () {
    Storage::fake('public');
    $this->actingAsAdmin();

    $response = $this->post(route('admin.media.store'), [
        'file' => UploadedFile::fake()->create('script.svg', 10, 'image/svg+xml'),
    ]);

    $response->assertSessionHasErrors('file');
    expect(Media::query()->count())->toBe(0);
});

test('an admin can delete a media file that is not used anywhere', function () {
    Storage::fake('public');
    $this->actingAsAdmin();
    $media = Media::factory()->create();
    Storage::disk('public')->put($media->path, 'fake-contents');

    $response = $this->delete(route('admin.media.destroy', $media));

    $response->assertRedirect();
    expect(Media::query()->find($media->id))->toBeNull();
    Storage::disk('public')->assertMissing($media->path);
});

test('deleting a media file used as a product featured image is blocked', function () {
    Storage::fake('public');
    $this->actingAsAdmin();
    $media = Media::factory()->create();
    Storage::disk('public')->put($media->path, 'fake-contents');
    $product = Product::factory()->create(['featured_image_id' => $media->id]);

    $response = $this->delete(route('admin.media.destroy', $media));

    $response->assertRedirect();
    expect(Media::query()->find($media->id))->not->toBeNull();
    Storage::disk('public')->assertExists($media->path);
});

test('a media file can be deleted once it is no longer any product\'s featured image', function () {
    Storage::fake('public');
    $this->actingAsAdmin();
    $media = Media::factory()->create();
    Storage::disk('public')->put($media->path, 'fake-contents');
    $product = Product::factory()->create(['featured_image_id' => $media->id]);
    $product->update(['featured_image_id' => null]);

    $response = $this->delete(route('admin.media.destroy', $media));

    $response->assertRedirect();
    expect(Media::query()->find($media->id))->toBeNull();
});

test('deleting a media file still used by a soft-deleted product is blocked', function () {
    Storage::fake('public');
    $this->actingAsAdmin();
    $media = Media::factory()->create();
    Storage::disk('public')->put($media->path, 'fake-contents');
    $product = Product::factory()->create(['featured_image_id' => $media->id]);
    $product->delete();

    $response = $this->delete(route('admin.media.destroy', $media));

    $response->assertRedirect();
    expect(Media::query()->find($media->id))->not->toBeNull();
});

test('a non-admin cannot manage media', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.media.index'))->assertForbidden();
});
