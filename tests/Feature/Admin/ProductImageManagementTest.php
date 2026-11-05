<?php

use App\Actions\Products\ImportBundledProductImagesAction;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(ProductImage::DISK);
});

function attachImage(Product $product, int $sortOrder): ProductImage
{
    $media = Media::factory()->create(['path' => "products/{$sortOrder}.webp"]);
    Storage::disk('public')->put($media->path, 'x');

    return ProductImage::query()->create([
        'product_id' => $product->id,
        'media_id' => $media->id,
        'sort_order' => $sortOrder,
    ]);
}

test('the edit page lists the product images in order with the image spec', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    attachImage($product, 1);
    $first = attachImage($product, 0);

    $this->get(route('admin.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('images.0.id', $first->id)
            ->has('images', 2)
            ->where('imageSpec.size', 960)
            ->where('imageSpec.max_kb', 1024));
});

test('an image that is not square is cropped and resized to the fixed size', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();

    $this->post(route('admin.products.images.store', $product), [
        'image' => UploadedFile::fake()->image('wide.webp', 1600, 1000),
    ])->assertRedirect();

    $image = $product->images()->with('media')->firstOrFail();
    Storage::disk(ProductImage::DISK)->assertExists($image->media->path);
    [$width, $height] = getimagesizefromstring(Storage::disk(ProductImage::DISK)->get($image->media->path));
    expect([$width, $height])->toBe([ProductImage::IMAGE_SIZE, ProductImage::IMAGE_SIZE])
        ->and($image->media->mime_type)->toBe('image/webp');
});

test('an image that already has the fixed size is stored byte for byte', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $file = UploadedFile::fake()->image('exact.webp', ProductImage::IMAGE_SIZE, ProductImage::IMAGE_SIZE);
    $original = file_get_contents($file->getRealPath());

    $this->post(route('admin.products.images.store', $product), ['image' => $file]);

    $image = $product->images()->with('media')->firstOrFail();
    expect(Storage::disk(ProductImage::DISK)->get($image->media->path))->toBe($original);
});

test('new images are appended to the end', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    attachImage($product, 4);

    $this->post(route('admin.products.images.store', $product), [
        'image' => UploadedFile::fake()->image('a.webp', 100, 100),
    ]);

    expect($product->images()->max('sort_order'))->toBe(5);
});

test('an upload needs a webp image of at most 1 MB', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();

    $this->post(route('admin.products.images.store', $product), [])->assertSessionHasErrors('image');
    $this->post(route('admin.products.images.store', $product), [
        'image' => UploadedFile::fake()->create('x.jpg', 10, 'image/jpeg'),
    ])->assertSessionHasErrors('image');
    $this->post(route('admin.products.images.store', $product), [
        'image' => UploadedFile::fake()->image('huge.webp', 100, 100)->size(1025),
    ])->assertSessionHasErrors('image');

    expect($product->images()->count())->toBe(0);
});

test('replacing an image keeps its position and removes the old file', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $image = attachImage($product, 3);
    $oldPath = $image->media->path;

    $this->post(route('admin.products.images.update', [$product, $image]), [
        'image' => UploadedFile::fake()->image('new.webp', 200, 200),
    ])->assertRedirect();

    $image->refresh()->load('media');
    expect($image->sort_order)->toBe(3)
        ->and($image->media->path)->not->toBe($oldPath)
        ->and(Media::query()->where('path', $oldPath)->exists())->toBeFalse();
    Storage::disk(ProductImage::DISK)->assertMissing($oldPath);
    Storage::disk(ProductImage::DISK)->assertExists($image->media->path);
});

test('images can be moved earlier and later', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $a = attachImage($product, 0);
    $b = attachImage($product, 0);
    $c = attachImage($product, 0);

    $this->post(route('admin.products.images.move', [$product, $c]), ['direction' => 'up'])->assertRedirect();
    expect($product->images()->pluck('id')->all())->toBe([$a->id, $c->id, $b->id]);

    $this->post(route('admin.products.images.move', [$product, $a]), ['direction' => 'up']);
    expect($product->images()->pluck('id')->all())->toBe([$a->id, $c->id, $b->id]);

    $this->post(route('admin.products.images.move', [$product, $a]), ['direction' => 'down']);
    expect($product->images()->pluck('id')->all())->toBe([$c->id, $a->id, $b->id]);
});

test('deleting an image removes its row, media and file', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $image = attachImage($product, 0);
    $path = $image->media->path;

    $this->delete(route('admin.products.images.destroy', [$product, $image]))->assertRedirect();

    expect(ProductImage::query()->count())->toBe(0)
        ->and(Media::query()->count())->toBe(0);
    Storage::disk(ProductImage::DISK)->assertMissing($path);
});

test('an image cannot be managed through another product', function () {
    $this->actingAsAdmin();
    $product = Product::factory()->create();
    $other = Product::factory()->create();
    $image = attachImage($product, 0);

    $this->delete(route('admin.products.images.destroy', [$other, $image]))->assertNotFound();

    expect(ProductImage::query()->count())->toBe(1);
});

test('non-admins cannot manage product images', function () {
    $this->actingAs(User::factory()->create(['is_admin' => false]));
    $product = Product::factory()->create();

    $this->post(route('admin.products.images.store', $product), [
        'image' => UploadedFile::fake()->image('a.webp', 100, 100),
    ])->assertForbidden();
});

test('the bundled storefront images are imported onto the featured product in order', function () {
    $product = Product::factory()->create(['is_active' => true]);

    expect(app(ImportBundledProductImagesAction::class)->execute())->toBe(4);

    $images = $product->images()->with('media')->get();
    expect($images)->toHaveCount(4)
        ->and($images->pluck('sort_order')->all())->toBe([0, 1, 2, 3]);
    Storage::disk(ProductImage::DISK)->assertExists($images->first()->media->path);
});

test('importing twice, or without a product, creates nothing', function () {
    expect(app(ImportBundledProductImagesAction::class)->execute())->toBe(0);

    Product::factory()->create(['is_active' => true]);
    app(ImportBundledProductImagesAction::class)->execute();

    expect(app(ImportBundledProductImagesAction::class)->execute())->toBe(0)
        ->and(ProductImage::query()->count())->toBe(4);
});

test('the storefront receives the product images', function () {
    $product = Product::factory()->create(['is_active' => true]);
    $image = attachImage($product, 0);

    $this->get('/')
        ->assertInertia(fn ($page) => $page
            ->has('productImages', 1)
            ->where('productImages.0.id', $image->id)
            ->where('productImages.0.src', $image->media->url()));
});
