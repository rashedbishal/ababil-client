<?php

use App\Enums\GallerySection;
use App\Models\GalleryItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(GalleryItem::DISK);
});

test('the gallery page lists the three fixed sections with their items', function () {
    $this->actingAsAdmin();
    GalleryItem::factory()->inSection(GallerySection::Routine)->create(['caption' => 'Shoulder']);

    $this->get(route('admin.gallery.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/gallery/index')
            ->has('sections', 3)
            ->where('sections.0.key', 'features')
            ->where('imageSpec.size', 800)
            ->where('imageSpec.max_kb', 1024)
            ->where('captionMaxLength', 60)
            ->where('sections.0.title', 'সবার স্বস্তি, সবার যত্ন')
            ->where('sections.0.is_visible', false)
            ->where('sections.1.key', 'routine')
            ->where('sections.1.title', 'কাঁধ থেকে পায়ের তলা')
            ->where('sections.1.is_visible', true)
            ->where('sections.1.items.0.caption', 'Shoulder')
            ->where('sections.2.key', 'campaign')
            ->where('sections.2.title', 'চেনা জীবনের যত্ন'));
});

test('a section whose photos are all hidden is reported as hidden', function () {
    $this->actingAsAdmin();
    GalleryItem::factory()->inactive()->inSection(GallerySection::Campaign)->create();

    $this->get(route('admin.gallery.index'))
        ->assertInertia(fn ($page) => $page
            ->where('sections.2.is_visible', false)
            ->has('sections.2.items', 1));
});

test('a photo that is not square is cropped and resized to the fixed size', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => UploadedFile::fake()->image('wide.webp', 1600, 1000),
        'caption' => 'আরাম',
        'is_active' => true,
    ])->assertRedirect();

    $item = GalleryItem::query()->firstOrFail();
    expect($item->section)->toBe(GallerySection::Features)
        ->and($item->caption)->toBe('আরাম')
        ->and($item->is_active)->toBeTrue()
        ->and($item->image_path)->toEndWith('.webp');

    Storage::disk(GalleryItem::DISK)->assertExists($item->image_path);
    [$width, $height] = getimagesizefromstring(Storage::disk(GalleryItem::DISK)->get($item->image_path));
    expect([$width, $height])->toBe([GalleryItem::IMAGE_SIZE, GalleryItem::IMAGE_SIZE]);
});

test('a small photo is scaled up to the fixed size', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'routine'), [
        'image' => UploadedFile::fake()->image('small.webp', 300, 300),
        'caption' => 'ছোট',
    ]);

    $item = GalleryItem::query()->firstOrFail();
    [$width, $height] = getimagesizefromstring(Storage::disk(GalleryItem::DISK)->get($item->image_path));
    expect([$width, $height])->toBe([GalleryItem::IMAGE_SIZE, GalleryItem::IMAGE_SIZE]);
});

test('a photo that already has the fixed size is stored byte for byte', function () {
    $this->actingAsAdmin();
    $file = UploadedFile::fake()->image('exact.webp', GalleryItem::IMAGE_SIZE, GalleryItem::IMAGE_SIZE);
    $original = file_get_contents($file->getRealPath());

    $this->post(route('admin.gallery.items.store', 'features'), ['image' => $file, 'caption' => 'x']);

    $item = GalleryItem::query()->firstOrFail();
    expect(Storage::disk(GalleryItem::DISK)->get($item->image_path))->toBe($original);
});

test('new photos are appended to the end of their own section', function () {
    $this->actingAsAdmin();
    GalleryItem::factory()->inSection(GallerySection::Features)->create(['sort_order' => 4]);
    GalleryItem::factory()->inSection(GallerySection::Campaign)->create(['sort_order' => 9]);

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => UploadedFile::fake()->image('a.webp', 100, 100),
        'caption' => 'নতুন',
    ]);

    expect(GalleryItem::query()->where('caption', 'নতুন')->value('sort_order'))->toBe(5);
});

test('an upload needs an image and a caption', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'features'), [])
        ->assertSessionHasErrors(['image', 'caption']);

    expect(GalleryItem::query()->count())->toBe(0);
});

test('only webp uploads are accepted', function (string $name, string $mime) {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => UploadedFile::fake()->create($name, 10, $mime),
        'caption' => 'x',
    ])->assertSessionHasErrors('image');
})->with([
    'jpg' => ['x.jpg', 'image/jpeg'],
    'png' => ['x.png', 'image/png'],
    'gif' => ['x.gif', 'image/gif'],
    'svg' => ['x.svg', 'image/svg+xml'],
    'pdf' => ['x.pdf', 'application/pdf'],
]);

test('an upload larger than 1 MB is rejected', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => UploadedFile::fake()->image('huge.webp', 100, 100)->size(1025),
        'caption' => 'x',
    ])->assertSessionHasErrors('image');

    expect(GalleryItem::query()->count())->toBe(0);
});

test('an upload of exactly 1 MB is accepted', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => UploadedFile::fake()->image('edge.webp', 100, 100)->size(1024),
        'caption' => 'x',
    ])->assertSessionDoesntHaveErrors();
});

test('a caption longer than the cap is rejected and one at the cap is accepted', function () {
    $this->actingAsAdmin();
    $image = fn () => UploadedFile::fake()->image('a.webp', 100, 100);

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => $image(),
        'caption' => str_repeat('অ', GalleryItem::CAPTION_MAX_LENGTH + 1),
    ])->assertSessionHasErrors('caption');

    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => $image(),
        'caption' => str_repeat('অ', GalleryItem::CAPTION_MAX_LENGTH),
    ])->assertSessionDoesntHaveErrors();

    expect(GalleryItem::query()->count())->toBe(1);
});

test('an unknown section is a 404', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.gallery.items.store', 'nope'), [
        'image' => UploadedFile::fake()->image('a.webp'),
        'caption' => 'x',
    ])->assertNotFound();
});

test('an admin can edit a caption without touching the photo', function () {
    $this->actingAsAdmin();
    $item = GalleryItem::factory()->create(['caption' => 'পুরনো', 'alt' => 'old alt', 'image_path' => 'gallery/keep.webp']);
    Storage::disk(GalleryItem::DISK)->put('gallery/keep.webp', 'x');

    $this->patch(route('admin.gallery.items.update', $item), ['caption' => 'নতুন', 'is_active' => true])
        ->assertRedirect();

    $item->refresh();
    expect($item->caption)->toBe('নতুন')
        ->and($item->image_path)->toBe('gallery/keep.webp')
        ->and($item->alt)->toBe('old alt');
    Storage::disk(GalleryItem::DISK)->assertExists('gallery/keep.webp');
});

test('replacing a photo stores the new one, deletes the old file and clears the alt text', function () {
    $this->actingAsAdmin();
    $item = GalleryItem::factory()->create(['alt' => 'old alt', 'image_path' => 'gallery/old.webp']);
    Storage::disk(GalleryItem::DISK)->put('gallery/old.webp', 'x');

    $this->post(route('admin.gallery.items.update', $item), [
        '_method' => 'patch',
        'image' => UploadedFile::fake()->image('new.webp', 400, 400),
        'caption' => $item->caption,
        'is_active' => true,
    ])->assertRedirect();

    $item->refresh();
    expect($item->image_path)->not->toBe('gallery/old.webp')
        ->and($item->alt)->toBeNull();
    Storage::disk(GalleryItem::DISK)->assertMissing('gallery/old.webp');
    Storage::disk(GalleryItem::DISK)->assertExists($item->image_path);
});

test('an admin can hide and show a photo', function () {
    $this->actingAsAdmin();
    $item = GalleryItem::factory()->create();

    $this->patch(route('admin.gallery.items.visibility', $item), ['is_active' => false])->assertRedirect();
    expect($item->refresh()->is_active)->toBeFalse();

    $this->patch(route('admin.gallery.items.visibility', $item), ['is_active' => true])->assertRedirect();
    expect($item->refresh()->is_active)->toBeTrue();
});

test('photos can be moved up and down within their section only', function () {
    $this->actingAsAdmin();
    $a = GalleryItem::factory()->create(['sort_order' => 0]);
    $b = GalleryItem::factory()->create(['sort_order' => 1]);
    $c = GalleryItem::factory()->create(['sort_order' => 2]);
    $other = GalleryItem::factory()->inSection(GallerySection::Campaign)->create(['sort_order' => 0]);

    $this->post(route('admin.gallery.items.move', $c), ['direction' => 'up'])->assertRedirect();

    expect($a->refresh()->sort_order)->toBe(0)
        ->and($c->refresh()->sort_order)->toBe(1)
        ->and($b->refresh()->sort_order)->toBe(2)
        ->and($other->refresh()->sort_order)->toBe(0);

    $this->post(route('admin.gallery.items.move', $c), ['direction' => 'down'])->assertRedirect();
    expect($b->refresh()->sort_order)->toBe(1)
        ->and($c->refresh()->sort_order)->toBe(2);
});

test('moving the first photo up or the last photo down changes nothing', function () {
    $this->actingAsAdmin();
    $a = GalleryItem::factory()->create(['sort_order' => 0]);
    $b = GalleryItem::factory()->create(['sort_order' => 1]);

    $this->post(route('admin.gallery.items.move', $a), ['direction' => 'up'])->assertRedirect();
    $this->post(route('admin.gallery.items.move', $b), ['direction' => 'down'])->assertRedirect();

    expect($a->refresh()->sort_order)->toBe(0)
        ->and($b->refresh()->sort_order)->toBe(1);
});

test('moving swaps correctly even when sort orders are tied', function () {
    $this->actingAsAdmin();
    $a = GalleryItem::factory()->create(['sort_order' => 0]);
    $b = GalleryItem::factory()->create(['sort_order' => 0]);

    $this->post(route('admin.gallery.items.move', $b), ['direction' => 'up']);

    expect($b->refresh()->sort_order)->toBe(0)
        ->and($a->refresh()->sort_order)->toBe(1);
});

test('an admin can delete a photo and its file', function () {
    $this->actingAsAdmin();
    $item = GalleryItem::factory()->create(['image_path' => 'gallery/gone.webp']);
    Storage::disk(GalleryItem::DISK)->put('gallery/gone.webp', 'x');

    $this->delete(route('admin.gallery.items.destroy', $item))->assertRedirect();

    expect(GalleryItem::query()->count())->toBe(0);
    Storage::disk(GalleryItem::DISK)->assertMissing('gallery/gone.webp');
});

test('a non-admin cannot manage the gallery', function () {
    $this->actingAs(User::factory()->create(['is_admin' => false]));
    $item = GalleryItem::factory()->create();

    $this->get(route('admin.gallery.index'))->assertForbidden();
    $this->post(route('admin.gallery.items.store', 'features'), [
        'image' => UploadedFile::fake()->image('a.webp'),
        'caption' => 'x',
    ])->assertForbidden();
    $this->patch(route('admin.gallery.items.visibility', $item), ['is_active' => false])->assertForbidden();
    $this->delete(route('admin.gallery.items.destroy', $item))->assertForbidden();

    expect($item->refresh()->is_active)->toBeTrue();
});

test('a guest is sent to log in', function () {
    $this->get(route('admin.gallery.index'))->assertRedirect(route('login'));
});
