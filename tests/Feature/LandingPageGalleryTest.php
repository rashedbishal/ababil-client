<?php

use App\Enums\GallerySection;
use App\Models\GalleryItem;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake(GalleryItem::DISK);
});

test('the landing page gets every section as an empty list when the gallery is empty', function () {
    $this->get(route('home'))->assertInertia(fn ($page) => $page
        ->where('gallery.features', [])
        ->where('gallery.routine', [])
        ->where('gallery.campaign', []));
});

test('the landing page only gets shown photos, in order, grouped by section', function () {
    GalleryItem::factory()->inSection(GallerySection::Features)->create(['caption' => 'second', 'sort_order' => 1]);
    GalleryItem::factory()->inSection(GallerySection::Features)->create(['caption' => 'first', 'sort_order' => 0]);
    GalleryItem::factory()->inSection(GallerySection::Features)->inactive()->create(['caption' => 'hidden']);
    GalleryItem::factory()->inSection(GallerySection::Routine)->create(['caption' => 'routine one']);

    $this->get(route('home'))->assertInertia(fn ($page) => $page
        ->has('gallery.features', 2)
        ->where('gallery.features.0.caption', 'first')
        ->where('gallery.features.1.caption', 'second')
        ->has('gallery.routine', 1)
        ->where('gallery.routine.0.caption', 'routine one')
        ->where('gallery.campaign', []));
});

test('a section with only hidden photos comes back empty so the storefront drops it', function () {
    GalleryItem::factory()->inSection(GallerySection::Campaign)->inactive()->count(2)->create();

    $this->get(route('home'))->assertInertia(fn ($page) => $page->where('gallery.campaign', []));
});

test('alt text falls back to the caption and the image is a public url', function () {
    GalleryItem::factory()->inSection(GallerySection::Features)->create([
        'caption' => 'ক্যাপশন',
        'alt' => null,
        'image_path' => 'gallery/a.webp',
    ]);
    GalleryItem::factory()->inSection(GallerySection::Routine)->create([
        'caption' => 'অন্য',
        'alt' => 'বর্ণনা',
    ]);

    $this->get(route('home'))->assertInertia(fn ($page) => $page
        ->where('gallery.features.0.alt', 'ক্যাপশন')
        ->where('gallery.features.0.image', Storage::disk(GalleryItem::DISK)->url('gallery/a.webp'))
        ->where('gallery.routine.0.alt', 'বর্ণনা'));
});
