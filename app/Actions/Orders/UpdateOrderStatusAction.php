<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderStatusTransitionException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * The single place order.status is ever written. Enforces one central
 * allowed-transition policy (see guardTransition()) and restores an order's
 * stock atomically when - and only when - it is cancelled.
 */
class UpdateOrderStatusAction
{
    /**
     * The fulfilment pipeline, in forward order. A transition between two of
     * these is only allowed moving strictly forward - skipping stages is
     * fine (e.g. a courier can report "Delivered" without us ever having
     * seen "Shipped" in between), moving backward is not.
     *
     * @var list<OrderStatus>
     */
    private const PIPELINE = [
        OrderStatus::Pending,
        OrderStatus::Confirmed,
        OrderStatus::Processing,
        OrderStatus::CourierSubmitted,
        OrderStatus::Shipped,
        OrderStatus::Delivered,
    ];

    /**
     * Pipeline stages a pre-delivery order can still be cancelled from.
     *
     * @var list<OrderStatus>
     */
    private const CANCELLABLE_FROM = [
        OrderStatus::Pending,
        OrderStatus::Confirmed,
        OrderStatus::Processing,
        OrderStatus::CourierSubmitted,
        OrderStatus::Shipped,
    ];

    /**
     * Stages a return can be recorded from - only once an order has at least
     * reached fulfilment processing.
     *
     * @var list<OrderStatus>
     */
    private const RETURNABLE_FROM = [
        OrderStatus::Processing,
        OrderStatus::CourierSubmitted,
        OrderStatus::Shipped,
        OrderStatus::Delivered,
    ];

    /**
     * @throws InvalidOrderStatusTransitionException
     */
    public function execute(Order $order, OrderStatus $status, ?User $changedBy, ?string $note = null): Order
    {
        return DB::transaction(function () use ($order, $status, $changedBy, $note): Order {
            // Re-fetch and lock fresh inside the transaction rather than
            // trusting the (possibly stale) $order passed in, so two
            // concurrent requests to change the same order's status can
            // never both act on the same "from" state.
            /** @var Order $locked */
            $locked = Order::query()->lockForUpdate()->findOrFail($order->id);
            $from = $locked->status;
            $isChange = $status !== $from;

            if ($isChange) {
                $this->guardTransition($from, $status);
            }

            $timestamps = match ($status) {
                OrderStatus::Confirmed => ['confirmed_at' => now()],
                OrderStatus::Shipped => ['shipped_at' => now()],
                OrderStatus::Delivered => ['delivered_at' => now()],
                OrderStatus::Cancelled => ['cancelled_at' => now()],
                default => [],
            };

            $locked->update([
                'status' => $status,
                ...$timestamps,
            ]);

            OrderStatusHistory::query()->create([
                'order_id' => $locked->id,
                'from_status' => $from,
                'to_status' => $status,
                'note' => $note,
                'changed_by' => $changedBy?->id,
            ]);

            // Cancelled is terminal (see guardTransition()), so this can
            // only ever run once per order - there is no path back into
            // Cancelled a second time to double-restore stock from.
            if ($isChange && $status === OrderStatus::Cancelled) {
                $this->restoreStock($locked);
            }

            return $locked;
        });
    }

    /**
     * @throws InvalidOrderStatusTransitionException
     */
    private function guardTransition(OrderStatus $from, OrderStatus $to): void
    {
        if ($from === OrderStatus::Cancelled || $from === OrderStatus::Returned) {
            throw InvalidOrderStatusTransitionException::terminal($from);
        }

        if ($to === OrderStatus::Cancelled) {
            if (! in_array($from, self::CANCELLABLE_FROM, true)) {
                throw InvalidOrderStatusTransitionException::notAllowed($from, $to);
            }

            return;
        }

        if ($to === OrderStatus::Returned) {
            if (! in_array($from, self::RETURNABLE_FROM, true)) {
                throw InvalidOrderStatusTransitionException::notAllowed($from, $to);
            }

            return;
        }

        $fromIndex = array_search($from, self::PIPELINE, true);
        $toIndex = array_search($to, self::PIPELINE, true);

        if ($fromIndex === false || $toIndex === false || $toIndex <= $fromIndex) {
            throw InvalidOrderStatusTransitionException::notAllowed($from, $to);
        }
    }

    /**
     * Restores the stock consumed when the order was placed (PlaceOrderAction
     * ::reserveStock()), item by item, using the quantities persisted on the
     * order itself - never anything derived from the current catalog/frontend.
     * Runs inside the same transaction/row-lock as the status change, so
     * stock and status can never end up out of sync with each other.
     */
    private function restoreStock(Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            $this->restoreItemStock($item);
        }
    }

    private function restoreItemStock(OrderItem $item): void
    {
        if ($item->variant_id !== null) {
            // A single atomic UPDATE - the row lock is held for the
            // statement's duration, the same guarantee reserveStock()'s
            // conditional decrement relies on for the opposite direction.
            ProductVariant::query()
                ->where('id', $item->variant_id)
                ->increment('stock', $item->quantity);

            return;
        }

        // variant_id is nullOnDelete(): a null here could mean this item
        // never had a variant, or that its variant was placed against one
        // that's since been hard-deleted. size_name is only ever snapshotted
        // when a variant was used, so it distinguishes the two. Falling
        // through to the product's stock pool in the latter case would
        // inflate a pool that was never actually decremented for this order
        // - silently under-restoring is the safer failure mode than that.
        if ($item->size_name !== null) {
            return;
        }

        if ($item->product_id === null) {
            return;
        }

        // withTrashed(): a discontinued (soft-deleted) product's stock
        // column still physically exists and should stay accurate even
        // though it's no longer visible in the catalog.
        Product::withTrashed()
            ->where('id', $item->product_id)
            ->where('track_stock', true)
            ->increment('stock', $item->quantity);
    }
}
