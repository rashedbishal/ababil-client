<?php

use App\Actions\Products\ImportBundledProductImagesAction;
use App\Models\Media;
use App\Models\ProductImage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Moves the product photos that were hard-coded into the storefront into
     * the product CMS so the live page is unchanged after deploy. Skipped
     * under test so every test starts with no product images (the action
     * itself is covered by its own test).
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        app(ImportBundledProductImagesAction::class)->execute();
    }

    public function down(): void
    {
        $media = Media::query()->whereIn('original_filename', [
            'product-1.webp', 'product-2.webp', 'product-3.webp', 'product-4.webp',
        ])->whereIn('id', ProductImage::query()->select('media_id'))->get();

        foreach ($media as $item) {
            Storage::disk($item->disk)->delete($item->path);
            $item->delete();
        }
    }
};
