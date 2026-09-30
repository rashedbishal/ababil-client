<?php

use App\Models\BlockedIp;
use App\Models\User;

test('guests are redirected to login when visiting the admin panel', function () {
    $response = $this->get(route('admin.dashboard'));

    $response->assertRedirect(route('login'));
});

test('non-admin users cannot access the admin panel', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $response = $this->actingAs($user)->get(route('admin.dashboard'));

    $response->assertForbidden();
});

test('admin users can access the admin panel', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
});

test('a blocked customer ip does not block admin access', function () {
    BlockedIp::factory()->create(['ip_address' => '127.0.0.1', 'is_active' => true]);
    $admin = User::factory()->create(['is_admin' => true]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
});
