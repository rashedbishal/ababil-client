<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ShippingAreaRequest;
use App\Models\ShippingArea;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ShippingAreaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/shipping-areas/index', [
            'shippingAreas' => ShippingArea::query()
                ->orderBy('sort_order')
                ->get()
                ->map(fn (ShippingArea $area) => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'charge' => (string) $area->charge,
                    'is_active' => $area->is_active,
                    'sort_order' => $area->sort_order,
                ]),
        ]);
    }

    public function store(ShippingAreaRequest $request): RedirectResponse
    {
        ShippingArea::query()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Shipping area created.']);

        return back();
    }

    public function update(ShippingAreaRequest $request, ShippingArea $shippingArea): RedirectResponse
    {
        $shippingArea->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Shipping area updated.']);

        return back();
    }

    public function destroy(ShippingArea $shippingArea): RedirectResponse
    {
        $shippingArea->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Shipping area deleted.']);

        return back();
    }
}
