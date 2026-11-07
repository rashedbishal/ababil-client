<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CertificateRequest;
use App\Models\Certificate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function index(): Response
    {
        $items = Certificate::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('admin/certificates/index', [
            'title' => 'Certificate trust section',
            'description' => 'Manage the certificates shown in the storefront trust section.',
            'isVisible' => $items->contains(fn (Certificate $item) => $item->is_active),
            'items' => $items->map(fn (Certificate $item) => [
                'id' => $item->id,
                'image_url' => $item->imageUrl(),
                'title' => $item->title,
                'subtitle' => $item->subtitle,
                'is_active' => $item->is_active,
            ])->values()->all(),
        ]);
    }

    public function store(CertificateRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['image_path'] = $request->file('image')->store('certificates', 'public');
        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['sort_order'] = (Certificate::query()->max('sort_order') ?? -1) + 1;

        Certificate::query()->create($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Certificate added.']);

        return back();
    }

    public function update(CertificateRequest $request, Certificate $certificate): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $oldPath = $certificate->image_path;
            $data['image_path'] = $request->file('image')->store('certificates', 'public');
            $this->deleteStoredImage($oldPath);
        }

        unset($data['image']);
        $certificate->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Certificate updated.']);

        return back();
    }

    public function updateVisibility(Request $request, Certificate $certificate): RedirectResponse
    {
        $validated = $request->validate(['is_active' => ['required', 'boolean']]);

        $certificate->update(['is_active' => $validated['is_active']]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $certificate->is_active ? 'Certificate is now shown on the storefront.' : 'Certificate is now hidden from the storefront.',
        ]);

        return back();
    }

    public function move(Request $request, Certificate $certificate): RedirectResponse
    {
        $validated = $request->validate(['direction' => ['required', 'in:up,down']]);

        DB::transaction(function () use ($certificate, $validated): void {
            $ids = Certificate::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->lockForUpdate()
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->values()
                ->all();

            $position = array_search($certificate->id, $ids, true);

            if ($position === false) {
                return;
            }

            $target = $validated['direction'] === 'up' ? $position - 1 : $position + 1;

            if (! isset($ids[$target])) {
                return;
            }

            [$ids[$position], $ids[$target]] = [$ids[$target], $ids[$position]];

            foreach ($ids as $index => $id) {
                Certificate::query()->whereKey($id)->update(['sort_order' => $index]);
            }
        });

        return back();
    }

    public function destroy(Certificate $certificate): RedirectResponse
    {
        $path = $certificate->image_path;

        $certificate->delete();
        $this->deleteStoredImage($path);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Certificate deleted.']);

        return back();
    }

    private function deleteStoredImage(?string $path): void
    {
        if ($path === null || $path === '' || str_starts_with($path, '/')) {
            return;
        }

        Storage::disk(Certificate::DISK)->delete($path);
    }
}
