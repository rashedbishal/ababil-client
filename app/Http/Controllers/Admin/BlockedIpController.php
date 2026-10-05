<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BlockedIpRequest;
use App\Models\BlockedIp;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BlockedIpController extends Controller
{
    public function index(): Response
    {
        $blockedIps = BlockedIp::query()
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/blocked-ips/index', [
            'blockedIps' => $blockedIps->through(fn (BlockedIp $blockedIp) => [
                'id' => $blockedIp->id,
                'ip_address' => $blockedIp->ip_address,
                'reason' => $blockedIp->reason,
                'blocked_at' => $blockedIp->blocked_at->toIso8601String(),
                'expires_at' => $blockedIp->expires_at?->toIso8601String(),
                'is_active' => $blockedIp->is_active,
                'is_currently_blocking' => $blockedIp->isCurrentlyBlocking(),
            ]),
        ]);
    }

    public function store(BlockedIpRequest $request): RedirectResponse
    {
        BlockedIp::query()->create([
            ...$request->validated(),
            'blocked_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'IP address blocked.']);

        return back();
    }

    public function update(BlockedIpRequest $request, BlockedIp $blockedIp): RedirectResponse
    {
        $blockedIp->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Blocked IP updated.']);

        return back();
    }

    public function destroy(BlockedIp $blockedIp): RedirectResponse
    {
        $blockedIp->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'IP address unblocked.']);

        return back();
    }
}
