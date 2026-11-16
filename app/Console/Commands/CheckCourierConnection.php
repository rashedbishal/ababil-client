<?php

namespace App\Console\Commands;

use App\Exceptions\CourierException;
use App\Exceptions\CourierUnreachableException;
use App\Services\Courier\CourierServiceInterface;
use App\Support\CourierHealth;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Detects when an unreachable courier comes back, so the admin panel's
 * courier features re-enable themselves without anyone having to retry.
 *
 * Scheduled every minute in routes/console.php, but only makes a request
 * while CourierHealth reports an outage - while the courier is healthy
 * this is a single cache read and no HTTP traffic at all.
 */
#[Signature('courier:check-connection')]
#[Description('While the courier is flagged unreachable, probe it and clear the flag once it answers')]
class CheckCourierConnection extends Command
{
    public function handle(CourierServiceInterface $courier): int
    {
        if (! CourierHealth::isUnreachable()) {
            return self::SUCCESS;
        }

        try {
            $courier->checkConnection();
        } catch (CourierUnreachableException) {
            // Still down; the failed probe already refreshed the flag.
            $this->warn('Courier is still unreachable.');

            return self::SUCCESS;
        } catch (CourierException) {
            // The courier answered (e.g. rejected the credentials), or no
            // provider is configured any more - either way it's not an
            // outage, so fall through and clear the flag.
        }

        CourierHealth::markReachable();
        $this->info('Courier is reachable again.');

        return self::SUCCESS;
    }
}
