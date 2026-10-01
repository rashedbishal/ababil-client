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
