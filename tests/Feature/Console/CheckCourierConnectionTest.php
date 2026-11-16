<?php

use App\Models\CourierProvider;
use App\Models\Setting;
use App\Support\CourierHealth;
use Illuminate\Support\Facades\Http;

function configurePathaoForConnectionCheck(): void
{
    Setting::set('courier_default_provider', 'pathao');
    CourierProvider::query()->create([
        'name' => 'pathao',
        'credentials' => [
            'base_url' => 'https://courier-api-sandbox.pathao.com',
            'client_id' => 'id',
            'client_secret' => 'secret',
            'username' => 'test@pathao.com',
            'password' => 'lovePathao',
            'store_id' => '123',
        ],
    ]);
}

test('it makes no request at all while the courier is healthy', function () {
    configurePathaoForConnectionCheck();
    Http::fake();

    $this->artisan('courier:check-connection')->assertExitCode(0);

    Http::assertNothingSent();
});

test('it clears the unreachable flag once the courier answers again', function () {
    configurePathaoForConnectionCheck();
    CourierHealth::markUnreachable();

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000, 'access_token' => 'token', 'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/stores' => Http::response(['data' => ['data' => []]]),
    ]);

    $this->artisan('courier:check-connection')->assertExitCode(0);

    expect(CourierHealth::isUnreachable())->toBeFalse();
});

test('it keeps the unreachable flag while the courier still times out', function () {
    configurePathaoForConnectionCheck();
    CourierHealth::markUnreachable();
    $since = CourierHealth::since();

    Http::fake([
        '*' => Http::failedConnection('cURL error 28: Operation timed out'),
    ]);

    $this->travel(2)->minutes();
    $this->artisan('courier:check-connection')->assertExitCode(0);

    // Same outage, same start time - so a dismissed alert stays dismissed.
    expect(CourierHealth::isUnreachable())->toBeTrue()
        ->and(CourierHealth::since())->toBe($since);
});

test('an error response still counts as reachable and clears the flag', function () {
    configurePathaoForConnectionCheck();
    CourierHealth::markUnreachable();

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response(['message' => 'Invalid credentials'], 401),
    ]);

    $this->artisan('courier:check-connection')->assertExitCode(0);

    expect(CourierHealth::isUnreachable())->toBeFalse();
});

test('the unreachable flag expires on its own if the scheduler is not running', function () {
    CourierHealth::markUnreachable();

    $this->travel(16)->minutes();

    expect(CourierHealth::isUnreachable())->toBeFalse();
});
