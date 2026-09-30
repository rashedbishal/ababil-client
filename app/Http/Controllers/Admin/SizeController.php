<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SizeRequest;
use App\Models\Size;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SizeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/sizes/index', [
            'sizes' => Size::query()
                ->withCount('variants')
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Size $size) => [
                    'id' => $size->id,
                    'name' => $size->name,
                    'slug' => $size->slug,
                    'sort_order' => $size->sort_order,
                    'is_active' => $size->is_active,
                    'variants_count' => $size->variants_count,
                ]),
        ]);
    }

    public function store(SizeRequest $request): RedirectResponse
    {
        Size::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Size created.']);

        return back();
    }

    public function update(SizeRequest $request, Size $size): RedirectResponse
    {
        $size->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Size updated.']);

        return back();
    }

    public function destroy(Size $size): RedirectResponse
    {
        $size->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Size deleted.']);

        return back();
    }
}
