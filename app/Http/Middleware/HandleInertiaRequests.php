<?php

namespace App\Http\Middleware;

use App\Enums\LogoSlot;
use App\Http\Controllers\Admin\CourierAlertController;
use App\Models\Logo;
use App\Models\Order;
use App\Support\CourierHealth;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'pendingOrdersCount' => $request->user()?->is_admin
                ? Order::query()->whereNull('viewed_at')->count()
                : null,
            'courierHealth' => $request->user()?->is_admin
                ? $this->courierHealth($request)
                : null,
            'sizeManagementEnabled' => (bool) config('catalog.size_set'),
            // Uploaded logo URLs, null where the bundled default applies.
            'logos' => [
                'site' => Logo::urlFor(LogoSlot::Site),
                'admin' => Logo::urlFor(LogoSlot::Admin),
            ],
        ];
    }

    /**
     * `alert` drives the one-time "courier unreachable" modal: shown once
     * per outage per login. Dismissing it records that outage's start time
     * in the session (CourierAlertController), and logging out invalidates
     * the session - so the next login while still down shows it again, as
     * does a fresh outage later in the same session.
     *
     * @return array{unreachable: bool, since: string|null, alert: bool}
     */
    private function courierHealth(Request $request): array
    {
        $since = CourierHealth::since();

        return [
            'unreachable' => $since !== null,
            'since' => $since,
            'alert' => $since !== null && $request->session()->get(CourierAlertController::SESSION_KEY) !== $since,
        ];
    }
}
