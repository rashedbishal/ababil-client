<?php

namespace App\Http\Controllers;

use App\Actions\Orders\PlaceOrderAction;
use App\Exceptions\OrderPlacementException;
use App\Http\Requests\PlaceOrderRequest;
use App\Jobs\SendFacebookPurchaseEvent;
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

        // Queued (not called inline) so a slow/unreachable Graph API never
        // delays this response. _fbp/_fbc are read here, not inside the job,
        // because they're cookies on this request - the pixel's own base
        // code sets them on the customer's browser, and since the pixel
        // snippet and this backend share an origin, they ride along with
        // this same POST automatically.
        SendFacebookPurchaseEvent::dispatch(
            $order->id,
            is_string($request->cookie('_fbp')) ? $request->cookie('_fbp') : null,
            is_string($request->cookie('_fbc')) ? $request->cookie('_fbc') : null,
        );

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
