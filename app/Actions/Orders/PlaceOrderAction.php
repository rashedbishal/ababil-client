<?php

namespace App\Actions\Orders;

use App\Enums\IncompleteOrderConversionStatus;
use App\Enums\OrderStatus;
use App\Exceptions\OrderPlacementException;
use App\Models\IncompleteOrder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Setting;
use App\Models\ShippingArea;
use App\Support\Decimal;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Centralized, backend-trusted order creation.
 *
 * Every price used to build the order is re-derived from the database
 * inside this action - nothing submitted by the client is ever trusted for
 * money. Stock is decremented with a locked, conditional update so
 * concurrent orders for the same item can never oversell it.
 */
class PlaceOrderAction
{
    /**
     * order_number collisions are astronomically unlikely (a 6-character
     * random suffix per day) but the unique constraint, not this check, is
     * the real source of truth - this bounds the retry rather than letting
     * a one-in-a-billion collision surface as a raw 500.
     */
    private const MAX_ORDER_NUMBER_ATTEMPTS = 3;

    /**
     * @param  array{
     *     product_id: int,
     *     variant_id: int|null,
     *     quantity: int,
     *     customer_name: string,
     *     customer_phone: string,
     *     delivery_address: string,
     *     shipping_area_id: int,
     *     customer_note: string|null,
     *     session_token: string|null,
     * }  $data
     */
    public function execute(array $data, ?string $ip, ?string $userAgent): Order
    {
        return DB::transaction(function () use ($data, $ip, $userAgent): Order {
            $this->guardAgainstOrderVelocity($data['customer_phone']);

            $product = Product::query()->lockForUpdate()->find($data['product_id']);

            if (! $product || ! $product->is_active) {
                throw new OrderPlacementException('This product is no longer available.');
            }

            $variant = null;

            if ($data['variant_id'] !== null) {
                $variant = ProductVariant::query()->lockForUpdate()->find($data['variant_id']);

                if (! $variant || $variant->product_id !== $product->id || ! $variant->is_active) {
                    throw new OrderPlacementException('The selected size is no longer available.');
                }
            } elseif ($product->hasVariants()) {
                throw new OrderPlacementException('Please select a size.');
            }

            $quantity = $data['quantity'];

            $this->reserveStock($product, $variant, $quantity);

            $shippingArea = ShippingArea::query()->where('is_active', true)->find($data['shipping_area_id']);

            if (! $shippingArea) {
                throw new OrderPlacementException('The selected shipping area is no longer available.');
            }

            $unitPrice = $variant?->currentPrice() ?? $product->currentPrice();
            $subtotal = bcmul($unitPrice, (string) $quantity, 2);
            $shippingCharge = $product->free_delivery ? '0.00' : Decimal::of($shippingArea->charge);
            $discount = '0.00';
            $grandTotal = bcsub(bcadd($subtotal, $shippingCharge, 2), $discount, 2);
            $duplicateNote = $this->detectDuplicateOrder($data['customer_phone'], $product->id);

            $order = $this->createOrder([
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'delivery_address' => $data['delivery_address'],
                'shipping_area_id' => $shippingArea->id,
                'shipping_area_name' => $shippingArea->name,
                'subtotal' => $subtotal,
                'shipping_charge' => $shippingCharge,
                'discount' => $discount,
                'grand_total' => $grandTotal,
                'status' => OrderStatus::Pending,
                'customer_ip' => $ip,
                'user_agent' => $userAgent,
                'customer_note' => $data['customer_note'] ?? null,
                'admin_note' => $duplicateNote,
            ]);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'product_name' => $product->name,
                'sku' => $variant !== null ? $variant->sku : $product->sku,
                'size_name' => $variant?->size?->name,
                'unit_price' => $unitPrice,
                'weight' => $product->weight,
                'quantity' => $quantity,
                'line_total' => $subtotal,
            ]);

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => null,
                'to_status' => OrderStatus::Pending,
                'note' => 'Order placed by customer.',
            ]);

            // Convert every still-pending incomplete-order row this
            // purchase accounts for - not just the one matching this
            // browser's own session token. A shopper can abandon checkout
            // on one device/session and come back to complete it on
            // another (or after a session token rotated), leaving an
            // older row under the same phone number stuck as "incomplete"
            // forever even though they did, in fact, order. Already-
            // converted rows (a *previous*, separate order) are left
            // untouched.
            IncompleteOrder::query()
                ->where('conversion_status', IncompleteOrderConversionStatus::Pending)
                ->where(function ($query) use ($data): void {
                    $query->where('customer_phone', $data['customer_phone']);

                    if (! empty($data['session_token'])) {
                        $query->orWhere('session_token', $data['session_token']);
                    }
                })
                ->update([
                    'conversion_status' => IncompleteOrderConversionStatus::Converted,
                    'order_id' => $order->id,
                ]);

            return $order;
        });
    }

    /**
     * Atomically decrement stock so two concurrent orders can never oversell
     * the same product/variant. The `lockForUpdate` reads above serialize
     * access per row, and the conditional `stock >=` update is a second,
     * belt-and-braces guard against overselling.
     */
    private function reserveStock(Product $product, ?ProductVariant $variant, int $quantity): void
    {
        if ($variant !== null) {
            $updated = ProductVariant::query()
                ->where('id', $variant->id)
                ->where('stock', '>=', $quantity)
                ->decrement('stock', $quantity);

            if ($updated === 0) {
                throw new OrderPlacementException('Not enough stock available for the selected size.');
            }

            return;
        }

        if (! $product->track_stock) {
            return;
        }

        $updated = Product::query()
            ->where('id', $product->id)
            ->where('stock', '>=', $quantity)
            ->decrement('stock', $quantity);

        if ($updated === 0) {
            throw new OrderPlacementException('Not enough stock available for this product.');
        }
    }

    /**
     * Hard cap on orders per phone number in a rolling 24 hours. The
     * storefront has no login, so a phone number is the only meaningful
     * per-customer identity available to rate-limit against.
     */
    private function guardAgainstOrderVelocity(string $phone): void
    {
        $recentCount = Order::query()
            ->where('customer_phone', $phone)
            ->where('created_at', '>=', now()->subDay())
            ->count();

        if ($recentCount >= (int) config('orders.max_orders_per_phone_per_day', 5)) {
            throw new OrderPlacementException(
                "You've placed several orders recently. Please contact us if you need to order again today.",
            );
        }
    }

    /**
     * A second order from the same phone for the same product within a
     * short window is a common spam/duplicate-submission pattern, but
     * could also be a genuine reorder - it's flagged on the order for
     * admin review rather than blocked outright.
     */
    private function detectDuplicateOrder(string $phone, int $productId): ?string
    {
        $windowMinutes = (int) config('orders.duplicate_order_window_minutes', 15);

        $duplicate = Order::query()
            ->where('customer_phone', $phone)
            ->where('created_at', '>=', now()->subMinutes($windowMinutes))
            ->whereHas('items', fn ($query) => $query->where('product_id', $productId))
            ->latest()
            ->first();

        if (! $duplicate) {
            return null;
        }

        return sprintf(
            'Possible duplicate: %s placed order %s for the same product %s.',
            $phone,
            $duplicate->order_number,
            $duplicate->created_at->diffForHumans(),
        );
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createOrder(array $attributes): Order
    {
        for ($attempt = 1; $attempt <= self::MAX_ORDER_NUMBER_ATTEMPTS; $attempt++) {
            try {
                return Order::query()->create([
                    ...$attributes,
                    'order_number' => $this->generateOrderNumber(),
                ]);
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt >= self::MAX_ORDER_NUMBER_ATTEMPTS) {
                    throw $e;
                }
            }
        }

        throw new OrderPlacementException('Could not place the order. Please try again.');
    }

    private function generateOrderNumber(): string
    {
        $prefix = Setting::get('order_prefix', 'ORD');

        do {
            $candidate = sprintf('%s-%s-%s', $prefix, now()->format('ymd'), strtoupper(Str::random(6)));
        } while (Order::query()->where('order_number', $candidate)->exists());

        return $candidate;
    }
}
