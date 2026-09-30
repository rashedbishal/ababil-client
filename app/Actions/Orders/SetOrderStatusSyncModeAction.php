<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatusSyncMode;
use App\Models\Order;
use App\Models\User;

class SetOrderStatusSyncModeAction
{
    public function __construct(private readonly UpdateOrderStatusAction $updateOrderStatus) {}

    /**
     * Switches the order's status sync mode. Switching to Automated
     * immediately re-syncs order.status from the last known courier status,
     * so the order doesn't sit stale until the next courier refresh.
     */
    public function execute(Order $order, OrderStatusSyncMode $mode, ?User $changedBy): Order
    {
        $order->update(['status_sync_mode' => $mode]);

        if ($mode === OrderStatusSyncMode::Automated && $order->courier_status !== null) {
            $implied = $order->courier_status->toOrderStatus();

            if ($implied !== null && $implied !== $order->status) {
                $this->updateOrderStatus->execute(
                    $order,
                    $implied,
                    $changedBy,
                    'Synced from courier status: '.$order->courier_status->label(),
                );
            }
        }

        return $order->refresh();
    }
}
