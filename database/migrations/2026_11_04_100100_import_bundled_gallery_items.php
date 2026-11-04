<?php

use App\Actions\Gallery\ImportBundledGalleryAction;
use App\Models\GalleryItem;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Moves the photos that were hard-coded into the storefront into the
     * gallery CMS so the live page is unchanged after deploy. Skipped under
     * test so every test starts with an empty gallery (the action itself is
     * covered by its own test).
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        app(ImportBundledGalleryAction::class)->execute();
    }

    public function down(): void
    {
        $paths = GalleryItem::query()
            ->where('image_path', 'like', 'gallery/imported-%')
            ->pluck('image_path');

        Storage::disk(GalleryItem::DISK)->delete($paths->all());
        GalleryItem::query()->whereIn('image_path', $paths)->delete();
    }
};
