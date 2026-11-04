<?php

use App\Actions\Gallery\ImportBundledGalleryAction;
use App\Enums\GallerySection;
use App\Models\GalleryItem;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(GalleryItem::DISK);
});

test('the bundled storefront photos are imported into the gallery in their original order', function () {
    $created = app(ImportBundledGalleryAction::class)->execute();

    expect($created)->toBe(18)
        ->and(GalleryItem::query()->where('section', GallerySection::Features)->count())->toBe(6)
        ->and(GalleryItem::query()->where('section', GallerySection::Routine)->count())->toBe(6)
        ->and(GalleryItem::query()->where('section', GallerySection::Campaign)->count())->toBe(6);

    $first = GalleryItem::query()->where('section', GallerySection::Features)->orderBy('sort_order')->first();
    expect($first->caption)->toBe('সংসারের সবার ভরসা')
        ->and($first->sort_order)->toBe(0)
        ->and($first->is_active)->toBeTrue();
    Storage::disk(GalleryItem::DISK)->assertExists($first->image_path);
});

test('importing twice does not duplicate anything', function () {
    app(ImportBundledGalleryAction::class)->execute();

    expect(app(ImportBundledGalleryAction::class)->execute())->toBe(0)
        ->and(GalleryItem::query()->count())->toBe(18);
});

test('the import leaves an already-populated gallery alone', function () {
    GalleryItem::factory()->create();

    expect(app(ImportBundledGalleryAction::class)->execute())->toBe(0)
        ->and(GalleryItem::query()->count())->toBe(1);
});

test('source files that are missing are skipped', function () {
    expect(app(ImportBundledGalleryAction::class)->execute(sys_get_temp_dir().'/no-such-dir'))->toBe(0);
});
