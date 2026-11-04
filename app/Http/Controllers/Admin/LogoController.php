<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Logos\StoreLogoAction;
use App\Enums\LogoSlot;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\LogoRequest;
use App\Models\Logo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LogoController extends Controller
{
    public function index(): Response
    {
        $logos = Logo::query()->get()->keyBy(fn (Logo $logo) => $logo->slot->value);
        $disk = Storage::disk(Logo::DISK);

        return Inertia::render('admin/logos/index', [
            'maxKb' => Logo::IMAGE_MAX_KB,
            // Not named `logos`: that would replace the shared `logos` prop
            // (the uploaded logo URLs every page uses) on this page.
            'slots' => collect(LogoSlot::cases())->map(fn (LogoSlot $slot) => [
                'key' => $slot->value,
                'label' => $slot->label(),
                'description' => $slot->description(),
                'size' => $slot->size(),
                'formats' => array_values(array_unique(array_map('strtoupper', $slot->formats()))),
                'recommended_format' => $slot->recommendedFormat(),
                // Null when the bundled default is in use - the page shows
                // that default itself.
                'image_url' => ($logo = $logos->get($slot->value)) ? $disk->url($logo->image_path) : null,
            ])->values(),
        ]);
    }

    public function update(LogoRequest $request, LogoSlot $slot, StoreLogoAction $storeLogo): RedirectResponse
    {
        $stored = $storeLogo->execute($request->file('image'), $slot);
        $existing = Logo::query()->where('slot', $slot)->first();
        $oldPaths = $existing?->paths() ?? [];

        Logo::query()->updateOrCreate(['slot' => $slot], $stored);

        Storage::disk(Logo::DISK)->delete($oldPaths);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$slot->label()} updated."]);

        return back();
    }

    /**
     * Removes the upload so the bundled default applies again.
     */
    public function destroy(LogoSlot $slot): RedirectResponse
    {
        $logo = Logo::query()->where('slot', $slot)->first();

        if ($logo !== null) {
            $paths = $logo->paths();
            $logo->delete();
            Storage::disk(Logo::DISK)->delete($paths);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$slot->label()} reset to the default."]);

        return back();
    }
}
