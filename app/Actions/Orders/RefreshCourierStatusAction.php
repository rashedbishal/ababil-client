<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatusSyncMode;
use App\Exceptions\CourierException;
use App\Exceptions\InvalidOrderStatusTransitionException;
use App\Models\Order;
use App\Models\User;
use App\Services\Courier\CourierServiceInterface;
use Illuminate\Support\Facades\Log;

class RefreshCourierStatusAction
{
    public function __construct(private CourierServiceInterface $courier) {}

    /**
     * Pull the latest status for an order already submitted to the courier
     * and sync `orders.status` from it when the order's sync mode allows it.
     *
     * @throws CourierException
     */
    public function execute(Order $order, ?User $changedBy): Order
    {
        $parcel = $this->courier->getParcelStatus($order->courier_consignment_id);
        $trackingCode = $parcel->trackingCode ?? $order->courier_tracking_code;

        // Skip the write entirely when nothing's actually different - this
        // runs on every page visit to an in-flight order (plus the 2-minute
        // cron for every such order at once), and most polls see no change.
        // update() would otherwise still touch updated_at on every one of
        // those no-op polls, since Eloquent always counts a timestamp bump
        // as "dirty" even when every real column is identical.
        $courierFieldsChanged = $order->courier_status !== $parcel->status
            || $order->courier_raw_status !== $parcel->rawStatus
            || $order->courier_tracking_code !== $trackingCode;

        if ($courierFieldsChanged) {
            $order->update([
                'courier_status' => $parcel->status,
                'courier_raw_status' => $parcel->rawStatus,
                'courier_tracking_code' => $trackingCode,
            ]);
        }

        $statusChanged = false;

        if ($order->status_sync_mode === OrderStatusSyncMode::Automated) {
            $implied = $parcel->status->toOrderStatus();

            if ($implied !== null && $implied !== $order->status) {
                try {
                    // Executed against a freshly locked copy of this order,
                    // not this $order instance - hence the refresh() below
                    // whenever this branch runs, to pull that change back
                    // into the instance we're about to return.
                    app(UpdateOrderStatusAction::class)->execute(
                        $order,
                        $implied,
                        $changedBy,
                        'Synced from courier status: '.$parcel->status->label(),
                    );
                    $statusChanged = true;
                } catch (InvalidOrderStatusTransitionException $exception) {
                    // The courier's status would imply a move our own
                    // pipeline doesn't allow (e.g. a stale/out-of-order
                    // report while the order already moved further, or past
                    // a terminal status). courier_status/raw_status above
                    // are still updated either way; only the order.status
                    // sync is skipped.
                    Log::warning('Skipped an order status sync implied by courier status', [
                        'order_id' => $order->id,
                        'reason' => $exception->getMessage(),
                    ]);
                }
            }
        }

        return $courierFieldsChanged || $statusChanged ? $order->refresh() : $order;
    }
}
