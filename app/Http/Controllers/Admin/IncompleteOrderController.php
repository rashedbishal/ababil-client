<?php

namespace App\Http\Controllers\Admin;

use App\Enums\IncompleteOrderConversionStatus;
use App\Http\Controllers\Controller;
use App\Models\IncompleteOrder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class IncompleteOrderController extends Controller
{
    public function index(): Response
    {
        $incompleteOrders = IncompleteOrder::query()
            // Once a session's checkout actually goes through, it's an
            // order now - PlaceOrderAction already marks it Converted, so
            // it belongs in the orders list, not cluttering this one.
            ->where('conversion_status', '!=', IncompleteOrderConversionStatus::Converted)
            ->with(['product', 'variant.size', 'shippingArea'])
            ->latest('last_activity_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/incomplete-orders/index', [
            'incompleteOrders' => $incompleteOrders->through(fn (IncompleteOrder $incomplete) => [
                'id' => $incomplete->id,
                'product_name' => $incomplete->product?->name,
                'size_name' => $incomplete->variant?->size?->name,
                'quantity' => $incomplete->quantity,
                'customer_name' => $incomplete->customer_name,
                'customer_phone' => $incomplete->customer_phone,
                'shipping_area_name' => $incomplete->shippingArea?->name,
                'customer_ip' => $incomplete->customer_ip,
                'conversion_status' => $incomplete->conversion_status->label(),
                'last_activity_at' => $incomplete->last_activity_at?->toIso8601String(),
            ]),
        ]);
    }

    public function destroy(IncompleteOrder $incompleteOrder): RedirectResponse
    {
        $incompleteOrder->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Incomplete checkout deleted.']);

        return back();
    }
}
