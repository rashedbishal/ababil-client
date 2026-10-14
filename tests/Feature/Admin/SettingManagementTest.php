<?php

use App\Models\Setting;
use App\Models\User;

test('an admin can view and update site settings', function () {
    $this->actingAsAdmin();

    $response = $this->patch(route('admin.settings.update'), [
        'site_name' => 'Ababil',
        'site_phone' => '01700000000',
        'site_email' => 'hello@example.com',
        'currency' => 'BDT',
        'order_prefix' => 'ORD',
        'whatsapp_number' => '01700000000',
        'facebook_page_url' => 'https://facebook.com/ababil',
    ]);

    $response->assertRedirect();
    expect(Setting::get('site_name'))->toBe('Ababil')
        ->and(Setting::get('order_prefix'))->toBe('ORD');
});

test('settings reflect updated values on the edit page', function () {
    $this->actingAsAdmin();
    Setting::set('site_name', 'Previous Name');

    $response = $this->get(route('admin.settings.edit'));

    $response->assertInertia(fn ($page) => $page->where('settings.site_name', 'Previous Name'));
});

test('an admin can paste head and body tracking code', function () {
    $this->actingAsAdmin();

    $headCode = '<script>console.log("gtm")</script>';
    $bodyCode = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-ABC1234"></iframe></noscript>';

    $response = $this->patch(route('admin.settings.update'), [
        'head_code' => $headCode,
        'body_code' => $bodyCode,
    ]);

    $response->assertRedirect();
    expect(Setting::get('head_code'))->toBe($headCode)
        ->and(Setting::get('body_code'))->toBe($bodyCode);
});

test('an invalid facebook page url is rejected', function () {
    $this->actingAsAdmin();

    $response = $this->patch(route('admin.settings.update'), [
        'facebook_page_url' => 'not-a-url',
    ]);

    $response->assertSessionHasErrors('facebook_page_url');
});

test('an admin can save the facebook pixel id and conversions api access token', function () {
    $this->actingAsAdmin();

    $response = $this->patch(route('admin.settings.update'), [
        'facebook_pixel_id' => '123456789',
        'facebook_conversions_api_access_token' => 'EAAtest-token',
    ]);

    $response->assertRedirect();
    expect(Setting::get('facebook_pixel_id'))->toBe('123456789')
        ->and(Setting::getEncrypted('facebook_conversions_api_access_token'))->toBe('EAAtest-token')
        // Never stored in plaintext, unlike the pixel ID which isn't secret.
        ->and(Setting::get('facebook_conversions_api_access_token'))->not->toBe('EAAtest-token');
});

test('leaving the conversions api access token blank keeps the existing one', function () {
    $this->actingAsAdmin();
    Setting::setEncrypted('facebook_conversions_api_access_token', 'already-saved-token');

    $response = $this->patch(route('admin.settings.update'), [
        'facebook_pixel_id' => '123456789',
        'facebook_conversions_api_access_token' => '',
    ]);

    $response->assertRedirect();
    expect(Setting::getEncrypted('facebook_conversions_api_access_token'))->toBe('already-saved-token');
});

test('the settings edit page reports whether the access token is configured without exposing it', function () {
    $this->actingAsAdmin();
    Setting::setEncrypted('facebook_conversions_api_access_token', 'secret-value');

    $response = $this->get(route('admin.settings.edit'));

    $response->assertInertia(fn ($page) => $page
        ->where('settings.facebook_conversions_api_configured', true)
        ->missing('settings.facebook_conversions_api_access_token'));
});

test('a non-admin cannot view or update settings', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.settings.edit'))->assertForbidden();
    $this->actingAs($user)->patch(route('admin.settings.update'), ['site_name' => 'Hacked'])->assertForbidden();
});
