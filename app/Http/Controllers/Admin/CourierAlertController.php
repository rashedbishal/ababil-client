<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\CourierHealth;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Records that the admin has seen the "courier unreachable" modal for the
 * current outage, so it isn't shown again for the rest of this login
 * (see HandleInertiaRequests::courierHealth()).
 */
class CourierAlertController extends Controller
{
    public const SESSION_KEY = 'courier_alert_dismissed_for';

    public function dismiss(Request $request): RedirectResponse
    {
        $since = CourierHealth::since();

        if ($since !== null) {
            $request->session()->put(self::SESSION_KEY, $since);
        }

        return back();
    }
}
