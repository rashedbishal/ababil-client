<?php

namespace App\Http\Controllers\Admin;

use App\Actions\HeroBanner\StoreHeroBannerImageAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HeroBannerSlideRequest;
use App\Models\HeroBannerSlide;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroBannerController extends Controller
{
    public function index(): Response
    {
        $slides = HeroBannerSlide::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('admin/hero-banner/index', [
            'slides' => $slides->map(fn (HeroBannerSlide $slide) => [
                'id' => $slide->id,
                'alt' => $slide->alt,
                'is_active' => $slide->is_active,
                'desktop_image_url' => $slide->imageUrl('desktop'),
                'tab_image_url' => $slide->imageUrl('tab'),
                'mobile_image_url' => $slide->imageUrl('mobile'),
                'missing_variants' => $slide->missingVariants(),
            ])->values()->all(),
            'imageSpec' => [
                'desktop' => ['width' => 1600, 'height' => 900, 'max_kb' => 100],
                'tab' => ['width' => 1024, 'height' => 1220, 'max_kb' => 80],
                'mobile' => ['width' => 768, 'height' => 1200, 'max_kb' => 50],
            ],
            'warning' => 'If a banner slide is missing a desktop, tab, or mobile version, the app crops the available image for the missing breakpoint. That keeps the banner working, but the result will not look as sharp as a full three-version upload.',
        ]);
    }

    public function store(HeroBannerSlideRequest $request, StoreHeroBannerImageAction $storeImage): RedirectResponse
    {
        $data = [
            'alt' => $request->validated('alt'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => (HeroBannerSlide::query()->max('sort_order') ?? -1) + 1,
        ];

        foreach (['desktop', 'tab', 'mobile'] as $variant) {
            $file = $request->file($variant.'_image');

            if ($file !== null) {
                $data["{$variant}_image_path"] = $storeImage->execute($file, $variant);
            }
        }

        HeroBannerSlide::query()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Hero banner slide added.']);

        return back();
    }

    public function update(HeroBannerSlideRequest $request, HeroBannerSlide $heroBannerSlide, StoreHeroBannerImageAction $storeImage): RedirectResponse
    {
        $data = [
            'alt' => $request->validated('alt'),
            'is_active' => $request->boolean('is_active', $heroBannerSlide->is_active),
        ];

        foreach (['desktop', 'tab', 'mobile'] as $variant) {
            $file = $request->file($variant.'_image');

            if ($file !== null) {
                $column = "{$variant}_image_path";
                $oldPath = $heroBannerSlide->{$column};
                $data[$column] = $storeImage->execute($file, $variant);

                if (is_string($oldPath) && $oldPath !== '') {
                    Storage::disk(HeroBannerSlide::DISK)->delete($oldPath);
                }
            }
        }

        $heroBannerSlide->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Hero banner slide updated.']);

        return back();
    }

    public function updateVisibility(Request $request, HeroBannerSlide $heroBannerSlide): RedirectResponse
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        $heroBannerSlide->update(['is_active' => $validated['is_active']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $heroBannerSlide->is_active ? 'Hero banner slide is now shown on the storefront.' : 'Hero banner slide is now hidden from the storefront.',
        ]);

        return back();
    }

    public function move(Request $request, HeroBannerSlide $heroBannerSlide): RedirectResponse
    {
        $validated = $request->validate(['direction' => ['required', 'in:up,down']]);

        DB::transaction(function () use ($heroBannerSlide, $validated): void {
            $ids = HeroBannerSlide::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $position = array_search($heroBannerSlide->id, $ids, true);

            if ($position === false) {
                return;
            }

            $target = $validated['direction'] === 'up' ? $position - 1 : $position + 1;

            if (! isset($ids[$target])) {
                return;
            }

            [$ids[$position], $ids[$target]] = [$ids[$target], $ids[$position]];

            foreach ($ids as $index => $id) {
                HeroBannerSlide::query()->whereKey($id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }

    public function destroy(HeroBannerSlide $heroBannerSlide): RedirectResponse
    {
        foreach (['desktop', 'tab', 'mobile'] as $variant) {
            $path = $heroBannerSlide->{"{$variant}_image_path"};

            if (is_string($path) && $path !== '') {
                Storage::disk(HeroBannerSlide::DISK)->delete($path);
            }
        }

        $heroBannerSlide->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Hero banner slide deleted.']);

        return back();
    }
}
