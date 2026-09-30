<?php

namespace App\Services\Courier;

use App\Models\Order;
use App\Models\OrderItem;

/**
 * The data a courier provider needs to create a parcel/consignment for an order.
 *
 * Built from an Order so providers never receive more than they need and
 * courier credentials never have to pass through the frontend.
 */
final readonly class ParcelData
{
    public function __construct(
        public string $orderNumber,
        public string $recipientName,
        public string $recipientPhone,
        public string $deliveryAddress,
        public string $codAmount,
        public string $itemDescription,
        public int $itemQuantity,
        public float $itemWeightKg,
    ) {}

    public static function fromOrder(Order $order): self
    {
        $quantity = (int) $order->items->sum('quantity');

        $weight = $order->items->sum(
            fn (OrderItem $item): float => (float) ($item->weight ?? '0.5') * $item->quantity,
        );

        return new self(
            orderNumber: $order->order_number,
            recipientName: $order->customer_name,
            recipientPhone: $order->customer_phone,
            deliveryAddress: $order->delivery_address,
            codAmount: (string) $order->grand_total,
            itemDescription: $order->items->pluck('product_name')->implode(', '),
            itemQuantity: max(1, $quantity),
            itemWeightKg: min(10.0, max(0.5, $weight)),
        );
    }
}
