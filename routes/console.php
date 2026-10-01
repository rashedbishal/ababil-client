<?php

use App\Console\Commands\SyncCourierOrderStatuses;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command(SyncCourierOrderStatuses::class)
    ->cron(config('courier.status_sync_cron', '*/15 * * * *'))
    // The default 24h stuck-lock expiry is excessive against a 15-minute
    // cron interval - a hard crash (OOM-kill, not a graceful restart, which
    // Laravel already releases the lock for) would otherwise silently stop
    // this sync for the better part of a day. 30 minutes comfortably covers
    // a real run (a handful of sequential HTTP calls) with room to spare.
    ->withoutOverlapping(30);
