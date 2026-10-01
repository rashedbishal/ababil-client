<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

function actingAsManagingAdmin(array $overrides = []): User
{
    $admin = User::factory()->create(['is_admin' => true, ...$overrides]);
    test()->actingAs($admin);

    return $admin;
}

test('an admin sees other admins but not themselves or the mother admin', function () {
    $viewer = actingAsManagingAdmin();
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
    $motherAdmin = actingAsManagingAdmin(['is_mother_admin' => true]);
    $regularAdmin = User::factory()->create(['is_admin' => true]);

    $response = $this->get(route('admin.admins.index'));

    $response->assertInertia(fn ($page) => $page
        ->has('admins', 1)
        ->where('admins.0.id', $regularAdmin->id));
});

test('an admin can create a new admin account', function () {
    actingAsManagingAdmin();

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
    actingAsManagingAdmin();
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

test('an admin can change another admin\'s password', function () {
    actingAsManagingAdmin();
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
    actingAsManagingAdmin();
    $target = User::factory()->create(['is_admin' => true]);

    $response = $this->delete(route('admin.admins.destroy', $target));

    $response->assertRedirect();
    expect(User::query()->find($target->id))->toBeNull();
});

test('an admin cannot delete their own account through admin management', function () {
    $admin = actingAsManagingAdmin();

    $response = $this->delete(route('admin.admins.destroy', $admin));

    $response->assertForbidden();
    expect(User::query()->find($admin->id))->not->toBeNull();
});

test('an admin cannot edit their own account through admin management', function () {
    $admin = actingAsManagingAdmin();

    $response = $this->put(route('admin.admins.update', $admin), [
        'name' => 'Hacked Name',
        'email' => $admin->email,
    ]);

    $response->assertForbidden();
    expect($admin->fresh()->name)->not->toBe('Hacked Name');
});

test('no admin can delete the mother admin', function () {
    actingAsManagingAdmin();
    $motherAdmin = User::factory()->create(['is_admin' => true, 'is_mother_admin' => true]);

    $response = $this->delete(route('admin.admins.destroy', $motherAdmin));

    $response->assertForbidden();
    expect(User::query()->find($motherAdmin->id))->not->toBeNull();
});

test('no admin can edit the mother admin', function () {
    actingAsManagingAdmin();
    $motherAdmin = User::factory()->create(['is_admin' => true, 'is_mother_admin' => true]);

    $response = $this->put(route('admin.admins.update', $motherAdmin), [
        'name' => 'Hacked Mother',
        'email' => $motherAdmin->email,
    ]);

    $response->assertForbidden();
    expect($motherAdmin->fresh()->name)->not->toBe('Hacked Mother');
});

test('the mother admin cannot delete her own account either', function () {
    $motherAdmin = actingAsManagingAdmin(['is_mother_admin' => true]);

    $response = $this->delete(route('admin.admins.destroy', $motherAdmin));

    $response->assertForbidden();
    expect(User::query()->find($motherAdmin->id))->not->toBeNull();
});

test('admin management routes cannot target a non-admin user', function () {
    actingAsManagingAdmin();
    $nonAdmin = User::factory()->create(['is_admin' => false]);

    $this->delete(route('admin.admins.destroy', $nonAdmin))->assertNotFound();
    expect(User::query()->find($nonAdmin->id))->not->toBeNull();
});

test('a non-admin cannot access admin management at all', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.admins.index'))->assertForbidden();
});
