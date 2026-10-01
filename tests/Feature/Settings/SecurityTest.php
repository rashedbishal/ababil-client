<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

// Two-factor authentication is not implemented in this app -
// SecurityController::edit() never shares canManageTwoFactor/
// twoFactorEnabled/requiresConfirmation, unlike Fortify's own starter-kit
// scaffold this file was originally copied from. The three tests that used
// to live here asserted on that scaffold's contract rather than this
// controller's real one: skipUnlessFortifyHas(Features::twoFactorAuthentication())
// is always true in this app (2FA is never in config/fortify.php's feature
// list), so they permanently skipped - including the "disabled" case, whose
// own skip guard required 2FA to be enabled before it would ever run the
// scenario where it's disabled. This test replaces all three with one that
// actually exercises SecurityController's real, unconditional behavior.
test('security page renders with no two-factor props, since the feature is not implemented', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->withSession(['auth.password_confirmed_at' => time()])
        ->get(route('security.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/security')
            ->has('passwordRules')
            ->missing('canManageTwoFactor')
            ->missing('twoFactorEnabled')
            ->missing('requiresConfirmation'),
        );
});

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('security.edit'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('security.edit'))
        ->put(route('user-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

    $response
        ->assertSessionHasErrors('current_password')
        ->assertRedirect(route('security.edit'));
});
