<?php

namespace App\Console\Commands;

use App\Actions\Orders\RefreshCourierStatusAction;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use App\Exceptions\CourierException;
use App\Models\Order;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

/**
 * Pulls the latest courier status for every order still in flight, so
 * "Automated" status-sync mode (see Order::status_sync_mode) is actually
 * automated instead of only ever refreshing when an admin opens the order
 * page or clicks "Refresh status" by hand.
 *
 * Scheduled in routes/console.php. Processes orders one at a time (never
 * floods the courier API with concurrent requests) and skips orders in a
 * terminal status (Cancelled, Returned, Delivered) - those will never
 * usefully change again via polling.
 */
#[Signature('courier:sync-order-statuses')]
#[Description('Refreshes the courier status of every in-flight, automated-sync order')]
class SyncCourierOrderStatuses extends Command
{
    private const TERMINAL_STATUSES = [
        OrderStatus::Cancelled,
        OrderStatus::Returned,
        OrderStatus::Delivered,
    ];

    public function handle(RefreshCourierStatusAction $action): int
    {
        $synced = 0;
        $failed = 0;

        Order::query()
            ->where('status_sync_mode', OrderStatusSyncMode::Automated)
            ->whereNotNull('courier_consignment_id')
            ->whereNotIn('status', array_map(fn (OrderStatus $s) => $s->value, self::TERMINAL_STATUSES))
            ->orderBy('id')
            ->chunkById(50, function ($orders) use ($action, &$synced, &$failed): void {
                foreach ($orders as $order) {
                    try {
                        $action->execute($order, null);
                        $synced++;
                    } catch (CourierException $exception) {
                        $failed++;

                        Log::warning('Scheduled courier status sync failed for an order', [
                            'order_id' => $order->id,
                            'reason' => $exception->getMessage(),
                        ]);
                    }
                }
            });

        $this->info("Courier status sync complete: {$synced} synced, {$failed} failed.");

        return self::SUCCESS;
    }
}
