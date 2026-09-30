<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    private const KEYS = [
        'site_name',
        'site_phone',
        'site_email',
        'currency',
        'order_prefix',
        'facebook_pixel_id',
        'google_analytics_id',
        'whatsapp_number',
        'facebook_page_url',
    ];

    public function edit(): Response
    {
        $settings = collect(self::KEYS)->mapWithKeys(fn (string $key) => [$key => Setting::get($key)]);

        return Inertia::render('admin/settings/edit', [
            'settings' => $settings,
        ]);
    }

    public function update(SettingRequest $request): RedirectResponse
    {
        foreach ($request->validated() as $key => $value) {
            Setting::set($key, $value);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Settings updated.']);

        return back();
    }
}
