<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Gallery\StoreGalleryImageAction;
use App\Enums\GallerySection;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GalleryItemRequest;
use App\Models\GalleryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GalleryController extends Controller
{
    public function index(): Response
    {
        $items = GalleryItem::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->groupBy(fn (GalleryItem $item) => $item->section->value);

        return Inertia::render('admin/gallery/index', [
            'sections' => collect(GallerySection::cases())->map(function (GallerySection $section) use ($items) {
                $sectionItems = $items->get($section->value, collect());

                return [
                    'key' => $section->value,
                    'title' => $section->title(),
                    'description' => $section->description(),
                    'placement' => $section->placement(),
                    'has_order_button' => $section->hasOrderButton(),
                    // Mirrors the storefront rule: a section with no shown
                    // photos isn't rendered at all.
                    'is_visible' => $sectionItems->contains(fn (GalleryItem $item) => $item->is_active),
                    'items' => $sectionItems->map(fn (GalleryItem $item) => [
                        'id' => $item->id,
                        'image_url' => $item->imageUrl(),
                        'caption' => $item->caption,
                        'is_active' => $item->is_active,
                    ])->values(),
                ];
            })->values(),
        ]);
    }

    public function store(GalleryItemRequest $request, GallerySection $section, StoreGalleryImageAction $storeImage): RedirectResponse
    {
        $path = $storeImage->execute($request->file('image'));

        GalleryItem::query()->create([
            'section' => $section,
            'image_path' => $path,
            'caption' => $request->validated('caption'),
            'is_active' => $request->boolean('is_active', true),
            // New photos are appended to the end of their section - the
            // order is changed with the move up/down buttons.
            'sort_order' => (GalleryItem::query()->where('section', $section)->max('sort_order') ?? -1) + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Photo added.']);

        return back();
    }

    public function update(GalleryItemRequest $request, GalleryItem $galleryItem, StoreGalleryImageAction $storeImage): RedirectResponse
    {
        $data = [
            'caption' => $request->validated('caption'),
            'is_active' => $request->boolean('is_active', $galleryItem->is_active),
        ];
        $oldPath = null;

        if ($request->hasFile('image')) {
            $oldPath = $galleryItem->image_path;
            $data['image_path'] = $storeImage->execute($request->file('image'));
            // Any hand-written alt text described the old photo.
            $data['alt'] = null;
        }

        $galleryItem->update($data);

        if ($oldPath !== null) {
            Storage::disk(GalleryItem::DISK)->delete($oldPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Photo updated.']);

        return back();
    }

    public function updateVisibility(Request $request, GalleryItem $galleryItem): RedirectResponse
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        $galleryItem->update(['is_active' => $validated['is_active']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $galleryItem->is_active ? 'Photo is now shown on the storefront.' : 'Photo is now hidden from the storefront.',
        ]);

        return back();
    }

    public function move(Request $request, GalleryItem $galleryItem): RedirectResponse
    {
        $validated = $request->validate(['direction' => ['required', 'in:up,down']]);

        DB::transaction(function () use ($galleryItem, $validated): void {
            $ids = GalleryItem::query()
                ->where('section', $galleryItem->section)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $position = array_search($galleryItem->id, $ids, true);

            if ($position === false) {
                return;
            }

            $target = $validated['direction'] === 'up' ? $position - 1 : $position + 1;

            if (! isset($ids[$target])) {
                return;
            }

            [$ids[$position], $ids[$target]] = [$ids[$target], $ids[$position]];

            // Re-number the whole section so ties (or gaps left by deleted
            // photos) can't make a swap a no-op.
            foreach ($ids as $index => $id) {
                GalleryItem::query()->whereKey($id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }

    public function destroy(GalleryItem $galleryItem): RedirectResponse
    {
        $path = $galleryItem->image_path;

        $galleryItem->delete();
        Storage::disk(GalleryItem::DISK)->delete($path);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Photo deleted.']);

        return back();
    }
}
