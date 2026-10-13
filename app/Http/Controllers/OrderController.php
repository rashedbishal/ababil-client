<?php

namespace App\Http\Controllers;

use App\Actions\Orders\PlaceOrderAction;
use App\Exceptions\OrderPlacementException;
use App\Http\Requests\PlaceOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
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
                ...self::orderPayload($order),
                'status' => $order->status->label(),
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

        // The storefront shows the result in a modal on the same page rather
        // than navigating to the confirmation route above, so this flash -
        // not that route - is what actually reaches real customers and is
        // what the dataLayer purchase push (resources/js/hooks/use-checkout-form.ts)
        // reads from.
        Inertia::flash('orderPlaced', [
            ...self::orderPayload($order->load('items')),
        ]);

        return back();
    }

    /**
     * @return array{order_number: string, customer_name: string, shipping_area_name: string, subtotal: string, shipping_charge: string, discount: string, grand_total: string, items: Collection<int, array{sku: ?string, product_name: string, size_name: ?string, quantity: int, unit_price: string, line_total: string}>}
     */
    private static function orderPayload(Order $order): array
    {
        return [
            'order_number' => $order->order_number,
            'customer_name' => $order->customer_name,
            'shipping_area_name' => $order->shipping_area_name,
            'subtotal' => (string) $order->subtotal,
            'shipping_charge' => (string) $order->shipping_charge,
            'discount' => (string) $order->discount,
            'grand_total' => (string) $order->grand_total,
            'items' => $order->items->map(fn (OrderItem $item) => [
                'sku' => $item->sku,
                'product_name' => $item->product_name,
                'size_name' => $item->size_name,
                'quantity' => $item->quantity,
                'unit_price' => (string) $item->unit_price,
                'line_total' => (string) $item->line_total,
            ]),
        ];
    }
}
