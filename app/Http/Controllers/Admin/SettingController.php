<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Facebook's Conversions API access token is a secret: it is handled
     * separately below (never sent back to the browser, blank input on
     * save keeps the existing value) rather than through this plain
     * key/value loop, the same way courier credentials are. The pixel ID
     * is not secret - it's visible in any client-side pixel snippet - so
     * it's a normal key here.
     */
    private const SECRET_KEY = 'facebook_conversions_api_access_token';

    private const KEYS = [
        'site_name',
        'site_phone',
        'site_email',
        'currency',
        'order_prefix',
        'head_code',
        'body_code',
        'whatsapp_number',
        'facebook_page_url',
        'facebook_pixel_id',
        'hero_banner_interval_ms',
        'product_image_slider_interval_ms',
    ];

    public function edit(): Response
    {
        $defaultValues = [
            'hero_banner_interval_ms' => '7000',
            'product_image_slider_interval_ms' => '7000',
        ];

        $settings = [
            ...collect(self::KEYS)->mapWithKeys(fn (string $key) => [$key => Setting::get($key, $defaultValues[$key] ?? null)])->all(),
            'facebook_conversions_api_configured' => Setting::getEncrypted(self::SECRET_KEY) !== null,
        ];

        return Inertia::render('admin/settings/edit', [
            'settings' => $settings,
        ]);
    }

    public function update(SettingRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $accessToken = Arr::pull($data, self::SECRET_KEY);

        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }

        if (filled($accessToken)) {
            Setting::setEncrypted(self::SECRET_KEY, $accessToken);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Settings updated.']);

        return back();
    }
}
