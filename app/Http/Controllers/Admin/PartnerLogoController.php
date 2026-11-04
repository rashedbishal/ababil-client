<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Logos\StoreLogoAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PartnerLogoRequest;
use App\Models\PartnerLogo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PartnerLogoController extends Controller
{
    public function index(): Response
    {
        $items = PartnerLogo::query()->orderBy('sort_order')->orderBy('id')->get();

        return Inertia::render('admin/partners/index', [
            'title' => 'গুণগত মানে আস্থার প্রতিশ্রুতি',
            'description' => 'গুণগত মান বজায় রাখতে আমরা প্রতিটি ধাপে যত্নশীল।',
            // Mirrors the storefront rule: a strip with no shown logos isn't
            // rendered at all.
            'isVisible' => $items->contains(fn (PartnerLogo $item) => $item->is_active),
            'imageSpec' => [
                'size' => PartnerLogo::IMAGE_SIZE,
                'max_kb' => PartnerLogo::IMAGE_MAX_KB,
            ],
            'labelMaxLength' => PartnerLogo::LABEL_MAX_LENGTH,
            'items' => $items->map(fn (PartnerLogo $item) => [
                'id' => $item->id,
                'image_url' => $item->imageUrl(),
                'label' => $item->label,
                'is_active' => $item->is_active,
            ])->values(),
        ]);
    }

    public function store(PartnerLogoRequest $request, StoreLogoAction $storeLogo): RedirectResponse
    {
        $path = $storeLogo->storeSquare($request->file('image'), PartnerLogo::IMAGE_SIZE, 'partners', 'partner');

        PartnerLogo::query()->create([
            'image_path' => $path,
            'label' => $request->validated('label'),
            'is_active' => $request->boolean('is_active', true),
            // New logos are appended to the end of the strip - the order is
            // changed with the move left/right buttons.
            'sort_order' => (PartnerLogo::query()->max('sort_order') ?? -1) + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Partner logo added.']);

        return back();
    }

    public function update(PartnerLogoRequest $request, PartnerLogo $partnerLogo, StoreLogoAction $storeLogo): RedirectResponse
    {
        $data = [
            'label' => $request->validated('label'),
            'is_active' => $request->boolean('is_active', $partnerLogo->is_active),
        ];
        $oldPath = null;

        if ($request->hasFile('image')) {
            $oldPath = $partnerLogo->image_path;
            $data['image_path'] = $storeLogo->storeSquare($request->file('image'), PartnerLogo::IMAGE_SIZE, 'partners', 'partner');
        }

        $partnerLogo->update($data);

        if ($oldPath !== null) {
            Storage::disk(PartnerLogo::DISK)->delete($oldPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Partner logo updated.']);

        return back();
    }

    public function updateVisibility(Request $request, PartnerLogo $partnerLogo): RedirectResponse
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        $partnerLogo->update(['is_active' => $validated['is_active']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $partnerLogo->is_active ? 'Logo is now shown on the storefront.' : 'Logo is now hidden from the storefront.',
        ]);

        return back();
    }

    public function move(Request $request, PartnerLogo $partnerLogo): RedirectResponse
    {
        $validated = $request->validate(['direction' => ['required', 'in:up,down']]);

        DB::transaction(function () use ($partnerLogo, $validated): void {
            $ids = PartnerLogo::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $position = array_search($partnerLogo->id, $ids, true);

            if ($position === false) {
                return;
            }

            $target = $validated['direction'] === 'up' ? $position - 1 : $position + 1;

            if (! isset($ids[$target])) {
                return;
            }

            [$ids[$position], $ids[$target]] = [$ids[$target], $ids[$position]];

            // Re-number everything so ties (or gaps left by deleted logos)
            // can't make a swap a no-op.
            foreach ($ids as $index => $id) {
                PartnerLogo::query()->whereKey($id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }

    public function destroy(PartnerLogo $partnerLogo): RedirectResponse
    {
        $path = $partnerLogo->image_path;

        $partnerLogo->delete();
        Storage::disk(PartnerLogo::DISK)->delete($path);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Partner logo deleted.']);

        return back();
    }
}
