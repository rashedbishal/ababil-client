<?php

use App\Models\CourierProvider;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('an admin can save courier provider credentials', function () {
    $this->actingAsAdmin();

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

test('pathao base_url accepts the documented production host', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'base_url' => 'https://api-hermes.pathao.com',
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect(CourierProvider::credentialsFor('pathao')['base_url'])->toBe('https://api-hermes.pathao.com');
});

test('pathao base_url rejects an arbitrary attacker-controlled host', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'base_url' => 'https://attacker.example',
    ]);

    $response->assertSessionHasErrors('base_url');
    expect(CourierProvider::credentialsFor('pathao'))->not->toHaveKey('base_url');
});

test('pathao base_url rejects a lookalike subdomain of a real pathao host', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'base_url' => 'https://api-hermes.pathao.com.attacker.com',
    ]);

    $response->assertSessionHasErrors('base_url');
});

test('pathao base_url rejects http where https is required', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'base_url' => 'http://api-hermes.pathao.com',
    ]);

    $response->assertSessionHasErrors('base_url');
});

test('pathao base_url rejects a malformed url', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'base_url' => 'not-a-url',
    ]);

    $response->assertSessionHasErrors('base_url');
});

test('pathao delivery_type rejects a value outside the documented Pathao codes', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'delivery_type' => '999',
    ]);

    $response->assertSessionHasErrors('delivery_type');
    expect(CourierProvider::credentialsFor('pathao'))->not->toHaveKey('delivery_type');
});

test('pathao item_type rejects a value outside the documented Pathao codes', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'pathao'), [
        'item_type' => '999',
    ]);

    $response->assertSessionHasErrors('item_type');
    expect(CourierProvider::credentialsFor('pathao'))->not->toHaveKey('item_type');
});

test('leaving a secret field blank does not overwrite the previously saved value', function () {
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

    $this->put(route('admin.courier.default'), ['provider' => 'steadfast']);
    expect(Setting::get('courier_default_provider'))->toBe('steadfast');

    $this->put(route('admin.courier.default'), ['provider' => null]);
    expect(Setting::get('courier_default_provider'))->toBeNull();
});

test('setting an unknown provider as default fails validation', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.default'), ['provider' => 'not-a-real-provider']);

    $response->assertSessionHasErrors('provider');
});

test('the default provider cannot be changed while steadfast and redx are both disabled', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.default'), ['provider' => 'pathao']);

    $response->assertForbidden();
    expect(Setting::get('courier_default_provider'))->toBe('pathao');
});

test('the default provider cannot be set to a disabled provider even when another alternate is enabled', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.default'), ['provider' => 'redx']);

    $response->assertSessionHasErrors('provider');
});

test('credentials cannot be saved for a disabled provider', function () {
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'steadfast'), ['api_key' => 'x']);

    $response->assertForbidden();
    expect(CourierProvider::credentialsFor('steadfast'))->toBe([]);
});

test('credentials can be saved for an enabled alternate provider', function () {
    config(['courier.providers.steadfast.enabled' => true]);
    $this->actingAsAdmin();

    $response = $this->put(route('admin.courier.update', 'steadfast'), [
        'base_url' => 'https://example.test',
        'api_key' => 'my-key',
        'secret_key' => 'my-secret',
    ]);

    $response->assertRedirect();
    expect(CourierProvider::credentialsFor('steadfast')['api_key'])->toBe('my-key');
});

test('the courier index pins pathao as default and reports the alternates as disabled', function () {
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

    $response = $this->postJson(route('admin.courier.pathao.stores'));

    $response->assertStatus(422)->assertJsonStructure(['message']);
});
