<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Products\StoreProductImageAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductImageRequest;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductImageController extends Controller
{
    public function store(ProductImageRequest $request, Product $product, StoreProductImageAction $storeImage): RedirectResponse
    {
        $media = $storeImage->execute($request->file('image'), $request->user()?->id);

        ProductImage::query()->create([
            'product_id' => $product->id,
            'media_id' => $media->id,
            // New photos are appended to the end - the order is changed with
            // the move earlier/later buttons.
            'sort_order' => ($product->images()->max('sort_order') ?? -1) + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Image added.']);

        return back();
    }

    /**
     * Replaces the file of an existing image, keeping its position. Sent as
     * a POST (not PATCH) because PHP only parses multipart bodies on POST.
     */
    public function update(ProductImageRequest $request, Product $product, ProductImage $image, StoreProductImageAction $storeImage): RedirectResponse
    {
        $old = $image->media;
        $media = $storeImage->execute($request->file('image'), $request->user()?->id);

        $image->update(['media_id' => $media->id]);
        $this->discard($old);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Image replaced.']);

        return back();
    }

    public function move(Request $request, Product $product, ProductImage $image): RedirectResponse
    {
        $validated = $request->validate(['direction' => ['required', 'in:up,down']]);

        DB::transaction(function () use ($product, $image, $validated): void {
            $ids = $product->images()
                ->reorder()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $position = array_search($image->id, $ids, true);

            if ($position === false) {
                return;
            }

            $target = $validated['direction'] === 'up' ? $position - 1 : $position + 1;

            if (! isset($ids[$target])) {
                return;
            }

            [$ids[$position], $ids[$target]] = [$ids[$target], $ids[$position]];

            // Re-number everything so ties (or gaps left by deleted images)
            // can't make a swap a no-op.
            foreach ($ids as $index => $id) {
                ProductImage::query()->whereKey($id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }

    public function destroy(Product $product, ProductImage $image): RedirectResponse
    {
        $media = $image->media;

        $image->delete();
        $this->discard($media);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Image deleted.']);

        return back();
    }

    /**
     * Deleting the Media row also cascades to its product_images row, so
     * callers must already have detached the image from it.
     */
    private function discard(Media $media): void
    {
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();
    }
}
