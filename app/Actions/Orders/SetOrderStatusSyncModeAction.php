<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatusSyncMode;
use App\Exceptions\InvalidOrderStatusTransitionException;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\Log;

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
                try {
                    $this->updateOrderStatus->execute(
                        $order,
                        $implied,
                        $changedBy,
                        'Synced from courier status: '.$order->courier_status->label(),
                    );
                } catch (InvalidOrderStatusTransitionException $exception) {
                    Log::warning('Skipped a re-sync implied by the last known courier status', [
                        'order_id' => $order->id,
                        'reason' => $exception->getMessage(),
                    ]);
                }
            }
        }

        return $order->refresh();
    }
}
