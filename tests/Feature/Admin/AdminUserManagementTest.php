<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('an admin sees other admins but not themselves or the mother admin', function () {
    $viewer = $this->actingAsAdmin();
    $otherAdmin = User::factory()->create(['is_admin' => true, 'name' => 'Other Admin']);
    $motherAdmin = User::factory()->create(['is_admin' => true, 'is_mother_admin' => true, 'name' => 'Mother Admin']);
    $nonAdmin = User::factory()->create(['is_admin' => false]);

    $response = $this->get(route('admin.admins.index'));

    $response->assertInertia(fn ($page) => $page
        ->has('admins', 1)
        ->where('admins.0.id', $otherAdmin->id));

    expect(collect($response->inertiaPage()['props']['admins'])->pluck('id'))
        ->not->toContain($viewer->id)
        ->not->toContain($motherAdmin->id)
        ->not->toContain($nonAdmin->id);
});

test('the mother admin sees regular admins but never herself', function () {
    $motherAdmin = $this->actingAsAdmin(['is_mother_admin' => true]);
    $regularAdmin = User::factory()->create(['is_admin' => true]);

    $response = $this->get(route('admin.admins.index'));

    $response->assertInertia(fn ($page) => $page
        ->has('admins', 1)
        ->where('admins.0.id', $regularAdmin->id));
});

test('an admin can create a new admin account', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.admins.store'), [
        'name' => 'New Admin',
        'email' => 'new-admin@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect();

    $created = User::query()->where('email', 'new-admin@example.com')->first();
    expect($created)->not->toBeNull()
        ->and($created->is_admin)->toBeTrue()
        ->and($created->is_mother_admin)->toBeFalse()
        ->and($created->email_verified_at)->not->toBeNull();
});

test('an admin can update another admin\'s name and email without touching the password', function () {
    $this->actingAsAdmin();
    $target = User::factory()->create(['is_admin' => true, 'password' => bcrypt('original-password')]);
    $originalHash = $target->password;

    $response = $this->put(route('admin.admins.update', $target), [
        'name' => 'Renamed Admin',
        'email' => 'renamed@example.com',
        'password' => '',
        'password_confirmation' => '',
    ]);

    $response->assertRedirect();
    $target->refresh();

    expect($target->name)->toBe('Renamed Admin')
        ->and($target->email)->toBe('renamed@example.com')
        ->and($target->password)->toBe($originalHash);
});

test('submitting is_mother_admin or is_admin on update cannot escalate privileges', function () {
    $this->actingAsAdmin();
    $target = User::factory()->create(['is_admin' => true, 'is_mother_admin' => false]);

    $response = $this->put(route('admin.admins.update', $target), [
        'name' => $target->name,
        'email' => $target->email,
        'is_mother_admin' => true,
        'is_admin' => false,
    ]);

    $response->assertRedirect();
    $target->refresh();

    expect($target->is_mother_admin)->toBeFalse()
        ->and($target->is_admin)->toBeTrue();
});

test('submitting is_mother_admin on create cannot grant mother-admin status', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.admins.store'), [
        'name' => 'New Admin',
        'email' => 'escalation-attempt@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'is_mother_admin' => true,
    ]);

    $created = User::query()->where('email', 'escalation-attempt@example.com')->first();
    expect($created)->not->toBeNull()
        ->and($created->is_mother_admin)->toBeFalse();
});

test('an admin can change another admin\'s password', function () {
    $this->actingAsAdmin();
    $target = User::factory()->create(['is_admin' => true]);

    $response = $this->put(route('admin.admins.update', $target), [
        'name' => $target->name,
        'email' => $target->email,
        'password' => 'brand-new-password',
        'password_confirmation' => 'brand-new-password',
    ]);

    $response->assertRedirect();

    expect(Hash::check('brand-new-password', $target->fresh()->password))->toBeTrue();
});

test('an admin can remove another admin account', function () {
    $this->actingAsAdmin();
    $target = User::factory()->create(['is_admin' => true]);

    $response = $this->delete(route('admin.admins.destroy', $target));

    $response->assertRedirect();
    expect(User::query()->find($target->id))->toBeNull();
});

test('an admin cannot delete their own account through admin management', function () {
    $admin = $this->actingAsAdmin();

    $response = $this->delete(route('admin.admins.destroy', $admin));

    $response->assertForbidden();
    expect(User::query()->find($admin->id))->not->toBeNull();
});

test('an admin cannot edit their own account through admin management', function () {
    $admin = $this->actingAsAdmin();

    $response = $this->put(route('admin.admins.update', $admin), [
        'name' => 'Hacked Name',
        'email' => $admin->email,
    ]);

    $response->assertForbidden();
    expect($admin->fresh()->name)->not->toBe('Hacked Name');
});

test('no admin can delete the mother admin', function () {
    $this->actingAsAdmin();
    $motherAdmin = User::factory()->create(['is_admin' => true, 'is_mother_admin' => true]);

    $response = $this->delete(route('admin.admins.destroy', $motherAdmin));

    $response->assertForbidden();
    expect(User::query()->find($motherAdmin->id))->not->toBeNull();
});

test('no admin can edit the mother admin', function () {
    $this->actingAsAdmin();
    $motherAdmin = User::factory()->create(['is_admin' => true, 'is_mother_admin' => true]);

    $response = $this->put(route('admin.admins.update', $motherAdmin), [
        'name' => 'Hacked Mother',
        'email' => $motherAdmin->email,
    ]);

    $response->assertForbidden();
    expect($motherAdmin->fresh()->name)->not->toBe('Hacked Mother');
});

test('the mother admin cannot delete her own account either', function () {
    $motherAdmin = $this->actingAsAdmin(['is_mother_admin' => true]);

    $response = $this->delete(route('admin.admins.destroy', $motherAdmin));

    $response->assertForbidden();
    expect(User::query()->find($motherAdmin->id))->not->toBeNull();
});

test('admin management routes cannot target a non-admin user', function () {
    $this->actingAsAdmin();
    $nonAdmin = User::factory()->create(['is_admin' => false]);

    $this->delete(route('admin.admins.destroy', $nonAdmin))->assertNotFound();
    expect(User::query()->find($nonAdmin->id))->not->toBeNull();
});

test('a non-admin cannot access admin management at all', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.admins.index'))->assertForbidden();
});
