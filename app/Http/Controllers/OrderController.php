<?php

namespace App\Http\Controllers;

use App\Actions\Orders\PlaceOrderAction;
use App\Exceptions\OrderPlacementException;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function confirmation(string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        return Inertia::render('order-confirmation', [
            'order' => [
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'shipping_area_name' => $order->shipping_area_name,
                'subtotal' => (string) $order->subtotal,
                'shipping_charge' => (string) $order->shipping_charge,
                'discount' => (string) $order->discount,
                'grand_total' => (string) $order->grand_total,
                'status' => $order->status->label(),
                'items' => $order->items->map(fn (OrderItem $item) => [
                    'product_name' => $item->product_name,
                    'size_name' => $item->size_name,
                    'quantity' => $item->quantity,
                    'unit_price' => (string) $item->unit_price,
                    'line_total' => (string) $item->line_total,
                ]),
            ],
        ]);
    }

    public function store(PlaceOrderRequest $request, PlaceOrderAction $action): RedirectResponse
    {
        try {
            $order = $action->execute(
                $request->toActionData(),
                $request->ip(),
                $request->userAgent(),
            );
        } catch (OrderPlacementException $exception) {
            return back()->withErrors(['order' => $exception->getMessage()])->withInput();
        }

        // The storefront shows the result in a modal on the same page
        // rather than navigating to a separate confirmation route.
        Inertia::flash('orderPlaced', [
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'shipping_area_name' => $order->shipping_area_name,
            'grand_total' => (string) $order->grand_total,
        ]);

        return back();
    }
}
