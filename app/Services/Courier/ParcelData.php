<?php

namespace App\Services\Courier;

use App\Models\Order;

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
    ) {}

    public static function fromOrder(Order $order): self
    {
        return new self(
            orderNumber: $order->order_number,
            recipientName: $order->customer_name,
            recipientPhone: $order->customer_phone,
            deliveryAddress: $order->delivery_address,
            codAmount: (string) $order->grand_total,
            itemDescription: $order->items->pluck('product_name')->implode(', '),
        );
    }
}
