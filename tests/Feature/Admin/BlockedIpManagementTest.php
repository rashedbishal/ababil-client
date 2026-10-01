<?php

use App\Models\BlockedIp;
use App\Models\User;

test('an admin can block an ip address', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.blocked-ips.store'), [
        'ip_address' => '203.0.113.9',
        'reason' => 'Repeated spam checkouts',
    ]);

    $response->assertRedirect();
    $blocked = BlockedIp::query()->where('ip_address', '203.0.113.9')->first();
    expect($blocked)->not->toBeNull()
        ->and($blocked->is_active)->toBeTrue();
});

test('blocking an ip normalizes its stored form', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.blocked-ips.store'), [
        'ip_address' => '::ffff:203.0.113.9',
    ]);

    expect(BlockedIp::query()->where('ip_address', '203.0.113.9')->exists())->toBeTrue()
        ->and(BlockedIp::query()->where('ip_address', '::ffff:203.0.113.9')->exists())->toBeFalse();
});

test('an ip already blocked under an equivalent representation cannot be blocked again', function () {
    $this->actingAsAdmin();
    BlockedIp::factory()->create(['ip_address' => '203.0.113.9']);

    $response = $this->post(route('admin.blocked-ips.store'), [
        'ip_address' => '::ffff:203.0.113.9',
    ]);

    $response->assertSessionHasErrors('ip_address');
    expect(BlockedIp::query()->count())->toBe(1);
});

test('an admin can update a blocked ip entry', function () {
    $this->actingAsAdmin();
    $blockedIp = BlockedIp::factory()->create(['reason' => 'old reason']);

    $response = $this->put(route('admin.blocked-ips.update', $blockedIp), [
        'ip_address' => $blockedIp->ip_address,
        'reason' => 'updated reason',
        'is_active' => false,
    ]);

    $response->assertRedirect();
    expect($blockedIp->fresh()->reason)->toBe('updated reason')
        ->and($blockedIp->fresh()->is_active)->toBeFalse();
});

test('an admin can unblock an ip address', function () {
    $this->actingAsAdmin();
    $blockedIp = BlockedIp::factory()->create();

    $response = $this->delete(route('admin.blocked-ips.destroy', $blockedIp));

    $response->assertRedirect();
    expect(BlockedIp::query()->find($blockedIp->id))->toBeNull();
});

test('an invalid ip address is rejected', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.blocked-ips.store'), [
        'ip_address' => 'not-an-ip',
    ]);

    $response->assertSessionHasErrors('ip_address');
    expect(BlockedIp::query()->count())->toBe(0);
});

test('a non-admin cannot manage blocked ips', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.blocked-ips.index'))->assertForbidden();
    $this->actingAs($user)->post(route('admin.blocked-ips.store'), ['ip_address' => '203.0.113.9'])->assertForbidden();
});

test('a guest cannot manage blocked ips', function () {
    $this->get(route('admin.blocked-ips.index'))->assertRedirect(route('login'));
});
