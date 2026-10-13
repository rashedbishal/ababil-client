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

test('a non-admin cannot view or update settings', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.settings.edit'))->assertForbidden();
    $this->actingAs($user)->patch(route('admin.settings.update'), ['site_name' => 'Hacked'])->assertForbidden();
});
