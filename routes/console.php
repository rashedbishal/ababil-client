<?php

use App\Console\Commands\CheckCourierConnection;
use App\Console\Commands\SyncCourierOrderStatuses;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// withoutOverlapping()'s second argument (releaseOnTerminationSignals) is
// false on every schedule below: Hostinger's PHP has pcntl_signal()
// blocked via disable_functions even though extension_loaded('pcntl')
// still reports true (common on shared hosting), so Laravel's own guard
// for that case (Event::ensureMutexIsReleasedOnSignal()) doesn't trip -
// it still calls the disabled function and throws "Call to undefined
// function pcntl_signal()", a fatal PHP Error that aborts the entire
// schedule:run tick before the command inside ever executes. This silently
// broke every withoutOverlapping() schedule on this server, including
// courier sync below. The lock itself (the actual overlap protection)
// still works without this - it's purely the "also release the lock if
// killed by a signal" belt-and-braces behavior that pcntl_signal enabled.
Schedule::command(SyncCourierOrderStatuses::class)
    ->cron(config('courier.status_sync_cron', '*/15 * * * *'))
    // The default 24h stuck-lock expiry is excessive against a 15-minute
    // cron interval - a hard crash (OOM-kill, not a graceful restart, which
    // Laravel already releases the lock for) would otherwise silently stop
    // this sync for the better part of a day. 30 minutes comfortably covers
    // a real run (a handful of sequential HTTP calls) with room to spare.
    ->withoutOverlapping(30, releaseOnTerminationSignals: false);

// Re-enables courier features (submit button, on-visit status refreshes)
// within a minute of an unreachable courier coming back. A no-op - no HTTP
// request at all - unless CourierHealth currently reports an outage.
Schedule::command(CheckCourierConnection::class)
    ->everyMinute()
    ->withoutOverlapping(2, releaseOnTerminationSignals: false);

// Hostinger shared hosting can't run a persistent `queue:work` daemon
// (no Supervisor, no long-lived processes outside cron) - `queue:restart`
// in deploy/post-deploy.sh only signals an already-running worker, which
// doesn't exist here. Draining the `database` queue once a minute via the
// same cron-driven schedule:run this app already depends on (see the
// courier sync above) is the standard workaround for this hosting
// constraint. --stop-when-empty exits as soon as the queue is drained
// instead of idling, and --max-time=50 guarantees it exits before the
// next minute's schedule:run tick even if a job is misbehaving.
Schedule::command('queue:work --stop-when-empty --max-time=50')
    ->everyMinute()
    ->withoutOverlapping(2, releaseOnTerminationSignals: false);
