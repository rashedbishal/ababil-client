<?php

namespace App\Support;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Collection;

class OrderPayload
{
    /**
     * Shared by `OrderController::store()` (the data shown in the storefront's
     * own result modal) and `LandingController::show()` (the same data,
     * rebuilt statelessly from `?placed=`) - and `confirmation()`, which adds
     * `status` on top of this.
     *
     * @return array{order_number: string, customer_name: string, shipping_area_name: string, subtotal: string, shipping_charge: string, discount: string, grand_total: string, items: Collection<int, array{sku: ?string, product_name: string, size_name: ?string, quantity: int, unit_price: string, line_total: string}>}
     */
    public static function build(Order $order): array
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
