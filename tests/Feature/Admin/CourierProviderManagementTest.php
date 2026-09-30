<?php

use App\Models\CourierProvider;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function actingAsCourierAdmin(): User
{
    $admin = User::factory()->create(['is_admin' => true]);
    test()->actingAs($admin);

    return $admin;
}

test('an admin can save courier provider credentials', function () {
    actingAsCourierAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'base_url' => 'https://courier-api-sandbox.pathao.com',
        'client_id' => 'my-client-id',
        'client_secret' => 'my-client-secret',
        'username' => 'me@example.com',
        'password' => 'super-secret',
        'delivery_type' => '48',
        'item_type' => '2',
    ]);

    $response->assertRedirect();

    $credentials = CourierProvider::credentialsFor('pathao');

    expect($credentials['client_id'])->toBe('my-client-id')
        ->and($credentials['client_secret'])->toBe('my-client-secret');
});

test('leaving a secret field blank does not overwrite the previously saved value', function () {
    actingAsCourierAdmin();

    CourierProvider::query()->create([
        'name' => 'pathao',
        'credentials' => ['client_secret' => 'already-saved-secret'],
    ]);

    $this->put(route('admin.courier.update', 'pathao'), [
        'client_id' => 'new-client-id',
        'client_secret' => '',
    ]);

    $credentials = CourierProvider::credentialsFor('pathao');

    expect($credentials['client_id'])->toBe('new-client-id')
        ->and($credentials['client_secret'])->toBe('already-saved-secret');
});

test('saved secret values are never sent back to the browser', function () {
    actingAsCourierAdmin();

    CourierProvider::query()->create([
        'name' => 'pathao',
        'credentials' => ['client_secret' => 'super-secret-value'],
    ]);

    $response = $this->get(route('admin.courier.index'));

    $response->assertOk();
    $response->assertDontSee('super-secret-value');
});

test('an admin can set and unset the default courier provider once an alternate is enabled', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    actingAsCourierAdmin();

    $this->put(route('admin.courier.default'), ['provider' => 'steadfast']);
    expect(Setting::get('courier_default_provider'))->toBe('steadfast');

    $this->put(route('admin.courier.default'), ['provider' => null]);
    expect(Setting::get('courier_default_provider'))->toBeNull();
});

test('setting an unknown provider as default fails validation', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    actingAsCourierAdmin();

    $response = $this->put(route('admin.courier.default'), ['provider' => 'not-a-real-provider']);

    $response->assertSessionHasErrors('provider');
});

test('the default provider cannot be changed while steadfast and redx are both disabled', function () {
    actingAsCourierAdmin();

    $response = $this->put(route('admin.courier.default'), ['provider' => 'pathao']);

    $response->assertForbidden();
    expect(Setting::get('courier_default_provider'))->toBe('pathao');
});

test('the default provider cannot be set to a disabled provider even when another alternate is enabled', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    actingAsCourierAdmin();

    $response = $this->put(route('admin.courier.default'), ['provider' => 'redx']);

    $response->assertSessionHasErrors('provider');
});

test('credentials cannot be saved for a disabled provider', function () {
    actingAsCourierAdmin();

    $response = $this->put(route('admin.courier.update', 'steadfast'), ['api_key' => 'x']);

    $response->assertForbidden();
    expect(CourierProvider::credentialsFor('steadfast'))->toBe([]);
});

test('credentials can be saved for an enabled alternate provider', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    actingAsCourierAdmin();

    $response = $this->put(route('admin.courier.update', 'steadfast'), [
        'base_url' => 'https://example.test',
        'api_key' => 'my-key',
        'secret_key' => 'my-secret',
    ]);

    $response->assertRedirect();
    expect(CourierProvider::credentialsFor('steadfast')['api_key'])->toBe('my-key');
});

test('the courier index pins pathao as default and reports the alternates as disabled', function () {
    actingAsCourierAdmin();

    $response = $this->get(route('admin.courier.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('defaultProvider', 'pathao')
        ->where('canChangeDefault', false)
        ->where('providers.0.name', 'pathao')
        ->where('providers.0.enabled', true)
        ->where('providers.0.is_default', true)
        ->where('providers.1.name', 'steadfast')
        ->where('providers.1.enabled', false)
        ->where('providers.2.name', 'redx')
        ->where('providers.2.enabled', false));
});

test('the courier index allows changing the default once an alternate is enabled', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    actingAsCourierAdmin();

    $response = $this->get(route('admin.courier.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('canChangeDefault', true)
        ->where('providers.1.enabled', true));
});

test('a non-admin cannot manage courier providers', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->put(route('admin.courier.update', 'pathao'), ['client_id' => 'x'])
        ->assertForbidden();
});

test('an admin can fetch and select a pathao store', function () {
    actingAsCourierAdmin();

    CourierProvider::query()->create([
        'name' => 'pathao',
        'credentials' => [
            'base_url' => 'https://courier-api-sandbox.pathao.com',
            'client_id' => 'id',
            'client_secret' => 'secret',
            'username' => 'me@example.com',
            'password' => 'password',
        ],
    ]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
        ]),
        '*/aladdin/api/v1/stores' => Http::response([
            'data' => ['data' => [
                ['store_id' => 111, 'store_name' => 'My Store', 'store_address' => '123 Road, Dhaka'],
            ]],
        ]),
    ]);

    $response = $this->postJson(route('admin.courier.pathao.stores'));

    $response->assertOk()->assertJson([
        'stores' => [
            ['id' => 111, 'name' => 'My Store', 'address' => '123 Road, Dhaka'],
        ],
    ]);

    $this->put(route('admin.courier.pathao.store'), ['store_id' => 111, 'store_name' => 'My Store']);

    $credentials = CourierProvider::credentialsFor('pathao');
    expect($credentials['store_id'])->toBe('111')
        ->and($credentials['store_name'])->toBe('My Store');
});

test('fetching stores returns a clear error when credentials are not configured', function () {
    actingAsCourierAdmin();

    $response = $this->postJson(route('admin.courier.pathao.stores'));

    $response->assertStatus(422)->assertJsonStructure(['message']);
});
