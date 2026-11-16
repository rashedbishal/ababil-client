<?php

namespace App\Console\Commands;

use App\Actions\Orders\RefreshCourierStatusAction;
use App\Exceptions\CourierException;
use App\Exceptions\CourierUnreachableException;
use App\Models\Order;
use App\Support\CourierHealth;
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
 * usefully change again via polling. Same selection criteria as
 * Order::needsCourierRefresh(), which also gates the on-visit refreshes on
 * the order page, orders index, and dashboard.
 */
#[Signature('courier:sync-order-statuses')]
#[Description('Refreshes the courier status of every in-flight, automated-sync order')]
class SyncCourierOrderStatuses extends Command
{
    public function handle(RefreshCourierStatusAction $action): int
    {
        // While the courier is known to be down, every order would just wait
        // out the same timeout. courier:check-connection clears this flag as
        // soon as the courier answers again; the next run catches up.
        if (CourierHealth::isUnreachable()) {
            $this->warn('Courier is unreachable; skipping this sync run.');

            return self::SUCCESS;
        }

        $synced = 0;
        $failed = 0;
        $unreachable = false;

        Order::query()
            ->needsCourierRefresh()
            ->orderBy('id')
            ->chunkById(50, function ($orders) use ($action, &$synced, &$failed, &$unreachable): bool {
                foreach ($orders as $order) {
                    try {
                        $action->execute($order, null);
                        $synced++;
                    } catch (CourierUnreachableException) {
                        // Stop the whole run rather than timing out once per
                        // remaining order; it resumes once the courier is back.
                        $unreachable = true;

                        return false;
                    } catch (CourierException $exception) {
                        $failed++;

                        Log::warning('Scheduled courier status sync failed for an order', [
                            'order_id' => $order->id,
                            'reason' => $exception->getMessage(),
                        ]);
                    }
                }

                return true;
            });

        if ($unreachable) {
            $this->warn("Courier became unreachable; stopped after {$synced} synced, {$failed} failed.");

            return self::SUCCESS;
        }

        $this->info("Courier status sync complete: {$synced} synced, {$failed} failed.");

        return self::SUCCESS;
    }
}
