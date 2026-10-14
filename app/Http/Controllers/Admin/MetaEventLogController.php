<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FacebookEventLog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MetaEventLogController extends Controller
{
    public function index(): Response
    {
        $logs = FacebookEventLog::query()
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/meta-events/index', [
            'logs' => $logs->through(fn (FacebookEventLog $log) => [
                'id' => $log->id,
                'order_id' => $log->order_id,
                'order_number' => $log->order_number,
                'event_name' => $log->event_name,
                'status' => $log->status->value,
                'status_label' => $log->status->label(),
                'http_status' => $log->http_status,
                'message' => $log->message,
                'created_at' => $log->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function destroyAll(): RedirectResponse
    {
        $count = FacebookEventLog::query()->count();

        FacebookEventLog::query()->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => $count === 1 ? '1 event log deleted.' : "{$count} event logs deleted."]);

        return back();
    }
}
