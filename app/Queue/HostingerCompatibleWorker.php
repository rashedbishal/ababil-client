<?php

namespace App\Queue;

use Illuminate\Queue\Worker;

/**
 * Hostinger's PHP has pcntl_signal() blocked via disable_functions even
 * though extension_loaded('pcntl') still reports true - the base Worker's
 * supportsAsyncSignals() check only looks at the latter, so daemon() (used
 * by `queue:work`, scheduled in routes/console.php) crashes with "Call to
 * undefined function Illuminate\Queue\pcntl_signal()" before processing a
 * single job.
 *
 * Forcing this false skips registering those signal handlers entirely.
 * The worker still processes jobs and still respects --stop-when-empty /
 * --max-time normally - it just can't be gracefully interrupted mid-job by
 * a SIGTERM, which doesn't matter here: this only ever runs as a
 * short-lived, cron-driven process (see routes/console.php), never a
 * long-running daemon under Supervisor that something would need to signal.
 */
class HostingerCompatibleWorker extends Worker
{
    protected function supportsAsyncSignals(): bool
    {
        return false;
    }
}
