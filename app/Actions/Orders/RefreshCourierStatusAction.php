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

        $order->update([
            'courier_status' => $parcel->status,
            'courier_raw_status' => $parcel->rawStatus,
            'courier_tracking_code' => $parcel->trackingCode ?? $order->courier_tracking_code,
        ]);

        if ($order->status_sync_mode === OrderStatusSyncMode::Automated) {
            $implied = $parcel->status->toOrderStatus();

            if ($implied !== null && $implied !== $order->status) {
                try {
                    app(UpdateOrderStatusAction::class)->execute(
                        $order,
                        $implied,
                        $changedBy,
                        'Synced from courier status: '.$parcel->status->label(),
                    );
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

        return $order->refresh();
    }
}
