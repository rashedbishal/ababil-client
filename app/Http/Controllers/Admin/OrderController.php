<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Orders\SetOrderStatusSyncModeAction;
use App\Actions\Orders\UpdateOrderStatusAction;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\OrderStatusSyncModeRequest;
use App\Http\Requests\Admin\OrderUpdateRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'status' => ['sometimes', 'nullable', new Enum(OrderStatus::class)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'order_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
        ]);

        $orders = Order::query()
            ->when($request->string('status')->toString(), fn ($query, $status) => $query->where('status', $status))
            ->when($request->string('phone')->toString(), fn ($query, $phone) => $query->where('customer_phone', 'like', "%{$phone}%"))
            ->when($request->string('order_number')->toString(), fn ($query, $number) => $query->where('order_number', 'like', "%{$number}%"))
            ->when($request->date('from'), fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($request->date('to'), fn ($query, $to) => $query->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders->through(fn (Order $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'grand_total' => (string) $order->grand_total,
                'created_at' => $order->created_at?->toIso8601String(),
            ]),
            'filters' => $request->only(['status', 'phone', 'order_number', 'from', 'to']),
            'statuses' => array_map(fn (OrderStatus $s) => ['value' => $s->value, 'label' => $s->label()], OrderStatus::cases()),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['items', 'shippingArea', 'statusHistories.changedBy']);

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'delivery_address' => $order->delivery_address,
                'shipping_area_name' => $order->shipping_area_name,
                'subtotal' => (string) $order->subtotal,
                'shipping_charge' => (string) $order->shipping_charge,
                'discount' => (string) $order->discount,
                'grand_total' => (string) $order->grand_total,
                'status' => $order->status->value,
                'courier_status' => $order->courier_status?->label(),
                'courier_raw_status' => $order->courier_raw_status,
                'status_sync_mode' => $order->status_sync_mode->value,
                'customer_ip' => $order->customer_ip,
                'user_agent' => $order->user_agent,
                'customer_note' => $order->customer_note,
                'admin_note' => $order->admin_note,
                'courier_provider' => $order->courier_provider,
                'courier_consignment_id' => $order->courier_consignment_id,
                'courier_tracking_code' => $order->courier_tracking_code,
                'created_at' => $order->created_at?->toIso8601String(),
                'updated_at' => $order->updated_at?->toIso8601String(),
                'items' => $order->items->map(fn (OrderItem $item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'sku' => $item->sku,
                    'size_name' => $item->size_name,
                    'unit_price' => (string) $item->unit_price,
                    'quantity' => $item->quantity,
                    'line_total' => (string) $item->line_total,
                ]),
                'history' => $order->statusHistories->map(fn (OrderStatusHistory $history) => [
                    'id' => $history->id,
                    'from_status' => $history->from_status?->label(),
                    'to_status' => $history->to_status->label(),
                    'note' => $history->note,
                    'changed_by' => $history->changedBy?->name,
                    'created_at' => $history->created_at?->toIso8601String(),
                ]),
            ],
            'statuses' => array_map(fn (OrderStatus $s) => ['value' => $s->value, 'label' => $s->label()], OrderStatus::cases()),
            'courierConfigured' => Setting::get('courier_default_provider') !== null,
        ]);
    }

    public function update(OrderUpdateRequest $request, Order $order, UpdateOrderStatusAction $action): RedirectResponse
    {
        $data = $request->validated();

        if (array_key_exists('status', $data)) {
            $action->execute($order, OrderStatus::from($data['status']), $request->user(), $data['admin_note'] ?? null);
            unset($data['status']);
        }

        if ($data !== []) {
            $order->update($data);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order updated.']);

        return back();
    }

    public function updateStatusSyncMode(OrderStatusSyncModeRequest $request, Order $order, SetOrderStatusSyncModeAction $action): RedirectResponse
    {
        $action->execute($order, OrderStatusSyncMode::from($request->validated('status_sync_mode')), $request->user());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status sync mode updated.']);

        return back();
    }
}
