<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IncompleteOrder;
use Inertia\Inertia;
use Inertia\Response;

class IncompleteOrderController extends Controller
{
    public function index(): Response
    {
        $incompleteOrders = IncompleteOrder::query()
            ->with(['product', 'variant.size', 'shippingArea', 'order'])
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
                'order_number' => $incomplete->order?->order_number,
                'last_activity_at' => $incomplete->last_activity_at?->toIso8601String(),
            ]),
        ]);
    }
}
