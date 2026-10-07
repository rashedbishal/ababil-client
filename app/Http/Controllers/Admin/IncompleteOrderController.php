<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Orders\PlaceOrderAction;
use App\Enums\IncompleteOrderConversionStatus;
use App\Exceptions\OrderPlacementException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConvertIncompleteOrderRequest;
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
                'delivery_address' => $incomplete->delivery_address,
                'shipping_area_name' => $incomplete->shippingArea?->name,
                'customer_ip' => $incomplete->customer_ip,
                'conversion_status' => $incomplete->conversion_status->label(),
                'last_activity_at' => $incomplete->last_activity_at?->toIso8601String(),
                // The modal only lets an admin fill in name/address - the
                // product, quantity, shipping area, and phone that an order
                // also needs come from this row as-is, so converting isn't
                // possible until the customer (or the debounced tracking
                // call) actually captured all of those.
                'can_convert' => $incomplete->product_id !== null
                    && $incomplete->quantity !== null
                    && $incomplete->shipping_area_id !== null
                    && $incomplete->customer_phone !== null,
            ]),
        ]);
    }

    /**
     * Manually completes an abandoned checkout into a real order, using
     * whatever product/quantity/shipping area/phone the customer already
     * got as far as giving, plus the name and address an admin confirms or
     * fills in here. Reuses PlaceOrderAction so pricing, stock, and order
     * creation stay identical to a customer-placed order - including that
     * action already marking this row (and any sibling row for the same
     * phone/session) Converted, which is what removes it from the index.
     */
    public function convert(ConvertIncompleteOrderRequest $request, IncompleteOrder $incompleteOrder, PlaceOrderAction $action): RedirectResponse
    {
        if ($incompleteOrder->conversion_status === IncompleteOrderConversionStatus::Converted) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This checkout has already been converted to an order.']);

            return back();
        }

        if ($incompleteOrder->product_id === null
            || $incompleteOrder->quantity === null
            || $incompleteOrder->shipping_area_id === null
            || $incompleteOrder->customer_phone === null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This checkout is missing product, quantity, phone, or shipping area information and cannot be converted.']);

            return back();
        }

        try {
            $order = $action->execute([
                'product_id' => $incompleteOrder->product_id,
                'variant_id' => $incompleteOrder->variant_id,
                'quantity' => $incompleteOrder->quantity,
                'customer_name' => $request->string('customer_name')->toString(),
                'customer_phone' => $incompleteOrder->customer_phone,
                'delivery_address' => $request->string('delivery_address')->toString(),
                'shipping_area_id' => $incompleteOrder->shipping_area_id,
                'customer_note' => null,
                'session_token' => $incompleteOrder->session_token,
            ], $incompleteOrder->customer_ip, $incompleteOrder->user_agent);
        } catch (OrderPlacementException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "Order {$order->order_number} created."]);

        return back();
    }

    public function destroy(IncompleteOrder $incompleteOrder): RedirectResponse
    {
        $incompleteOrder->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Incomplete checkout deleted.']);

        return back();
    }
}
