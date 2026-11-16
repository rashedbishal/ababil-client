<?php

use App\Enums\CourierStatus;
use App\Exceptions\CourierException;
use App\Exceptions\CourierUnreachableException;
use App\Models\CourierProvider;
use App\Models\CourierToken;
use App\Services\Courier\ParcelData;
use App\Services\Courier\PathaoCourierService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

function pathaoConfig(array $overrides = []): void
{
    CourierProvider::query()->updateOrCreate(
        ['name' => 'pathao'],
        ['credentials' => array_merge([
            'base_url' => 'https://courier-api-sandbox.pathao.com',
            'client_id' => 'test-client-id',
            'client_secret' => 'test-client-secret',
            'username' => 'test@pathao.com',
            'password' => 'lovePathao',
            'store_id' => '123',
            'delivery_type' => '48',
            'item_type' => '2',
        ], $overrides)],
    );
}

function sampleParcel(): ParcelData
{
    return new ParcelData(
        orderNumber: 'ORD-260930-ABC123',
        recipientName: 'Jane Doe',
        recipientPhone: '01711111111',
        deliveryAddress: '123 Example Road, Dhaka',
        codAmount: '1069.00',
        itemDescription: 'Classic Cotton T-Shirt',
        itemQuantity: 2,
        itemWeightKg: 1.0,
    );
}

test('it issues a new access token and creates a parcel', function () {
    pathaoConfig();

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'token_type' => 'Bearer',
            'expires_in' => 432000,
            'access_token' => 'issued-access-token',
            'refresh_token' => 'issued-refresh-token',
        ]),
        '*/aladdin/api/v1/orders' => Http::response([
            'message' => 'Order Created Successfully',
            'type' => 'success',
            'code' => 200,
            'data' => [
                'consignment_id' => 'CONSIGN-1',
                'merchant_order_id' => 'ORD-260930-ABC123',
                'order_status' => 'Pending',
                'delivery_fee' => 80,
            ],
        ]),
    ]);

    $result = (new PathaoCourierService)->createParcel(sampleParcel());

    expect($result->consignmentId)->toBe('CONSIGN-1')
        ->and($result->status)->toBe(CourierStatus::Pending)
        ->and($result->rawStatus)->toBe('Pending');

    Http::assertSent(fn ($request) => $request->url() === 'https://courier-api-sandbox.pathao.com/aladdin/api/v1/issue-token'
        && $request['grant_type'] === 'password'
        && $request['username'] === 'test@pathao.com');

    Http::assertSent(fn ($request) => $request->url() === 'https://courier-api-sandbox.pathao.com/aladdin/api/v1/orders'
        && $request['store_id'] === 123
        && $request['item_quantity'] === 2
        && $request['amount_to_collect'] === 1069
        && $request->hasHeader('Authorization', 'Bearer issued-access-token'));

    expect(CourierToken::query()->where('provider', 'pathao')->first())
        ->not->toBeNull();
});

test('it reuses a valid stored access token instead of issuing a new one', function () {
    pathaoConfig();

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'still-valid-token',
        'refresh_token' => 'still-valid-refresh',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-2', 'order_status' => 'Pending'],
        ]),
    ]);

    (new PathaoCourierService)->createParcel(sampleParcel());

    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'issue-token'));
    Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer still-valid-token'));
});

test('a courier token never serializes its access or refresh token', function () {
    $token = CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'plain-access-token',
        'refresh_token' => 'plain-refresh-token',
        'expires_at' => now()->addDay(),
    ]);

    expect($token->toArray())->not->toHaveKey('access_token')
        ->and($token->toArray())->not->toHaveKey('refresh_token')
        ->and($token->toJson())->not->toContain('plain-access-token')
        ->and($token->toJson())->not->toContain('plain-refresh-token');
});

test('stored tokens are encrypted at rest but read back transparently through the model', function () {
    $token = CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'plain-access-token',
        'refresh_token' => 'plain-refresh-token',
        'expires_at' => now()->addDay(),
    ]);

    expect($token->access_token)->toBe('plain-access-token')
        ->and($token->refresh_token)->toBe('plain-refresh-token')
        ->and($token->fresh()->access_token)->toBe('plain-access-token');

    $raw = DB::table('courier_tokens')->where('id', $token->id)->first();

    expect($raw->access_token)->not->toBe('plain-access-token')
        ->and($raw->access_token)->not->toContain('plain-access-token')
        ->and($raw->refresh_token)->not->toBe('plain-refresh-token')
        ->and($raw->refresh_token)->not->toContain('plain-refresh-token');
});

test('a token issued through the live flow is also stored encrypted', function () {
    pathaoConfig();

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'freshly-issued-token',
            'refresh_token' => 'freshly-issued-refresh',
        ]),
        '*/aladdin/api/v1/orders' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-ENC', 'order_status' => 'Pending'],
        ]),
    ]);

    (new PathaoCourierService)->createParcel(sampleParcel());

    $raw = DB::table('courier_tokens')->where('provider', 'pathao')->first();
    expect($raw->access_token)->not->toContain('freshly-issued-token');

    expect(CourierToken::query()->where('provider', 'pathao')->first()->access_token)
        ->toBe('freshly-issued-token');
});

test('the password-grant token request does not follow a redirect that could leak credentials to another host', function () {
    pathaoConfig();

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response(
            '',
            307,
            ['Location' => 'https://attacker.example/steal'],
        ),
        'https://attacker.example/*' => Http::response(['stolen' => true]),
    ]);

    try {
        (new PathaoCourierService)->createParcel(sampleParcel());
    } catch (CourierException) {
        // Expected: the faked 307 has no token payload, so issuing fails.
    }

    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'attacker.example'));
});

test('an authenticated courier request does not follow a redirect that could leak the access token to another host', function () {
    pathaoConfig();

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'still-valid-token',
        'refresh_token' => 'still-valid-refresh',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders' => Http::response(
            '',
            307,
            ['Location' => 'https://attacker.example/steal'],
        ),
        'https://attacker.example/*' => Http::response(['stolen' => true]),
    ]);

    try {
        (new PathaoCourierService)->createParcel(sampleParcel());
    } catch (Throwable) {
        // Expected: the faked 307 has no parcel payload, so creation fails
        // one way or another - the security property we're testing is that
        // the redirect itself is never followed, not how the failure shows up.
    }

    Http::assertNotSent(fn ($request) => str_contains($request->url(), 'attacker.example'));
});

test('it refreshes an expired token using the refresh token before falling back to password grant', function () {
    pathaoConfig();

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'expired-token',
        'refresh_token' => 'my-refresh-token',
        'expires_at' => now()->subDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'refreshed-access-token',
            'refresh_token' => 'new-refresh-token',
        ]),
        '*/aladdin/api/v1/orders' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-3', 'order_status' => 'Pending'],
        ]),
    ]);

    (new PathaoCourierService)->createParcel(sampleParcel());

    Http::assertSent(fn ($request) => str_contains($request->url(), 'issue-token')
        && $request['grant_type'] === 'refresh_token'
        && $request['refresh_token'] === 'my-refresh-token');

    expect(CourierToken::query()->where('provider', 'pathao')->first()->access_token)
        ->toBe('refreshed-access-token');
});

test('it discards a stored token and retries once when Pathao rejects it with a 401', function () {
    pathaoConfig();

    // Locally this token still looks valid (expires tomorrow) - the whole
    // point of this test is that Pathao itself has invalidated it server
    // side, which our own expiry bookkeeping can't know about in advance.
    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'stale-token',
        'refresh_token' => 'stale-refresh',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders' => Http::sequence()
            ->push(['message' => 'Unauthorized User'], 401)
            ->push(['data' => ['consignment_id' => 'CONSIGN-RETRY', 'order_status' => 'Pending']]),
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'fresh-access-token',
            'refresh_token' => 'fresh-refresh-token',
        ]),
    ]);

    $result = (new PathaoCourierService)->createParcel(sampleParcel());

    expect($result->consignmentId)->toBe('CONSIGN-RETRY');

    Http::assertSent(fn ($request) => str_contains($request->url(), 'issue-token')
        && $request['grant_type'] === 'password');

    expect(CourierToken::query()->where('provider', 'pathao')->first()->access_token)
        ->toBe('fresh-access-token');
});

test('it maps a known courier status and preserves the raw text', function (string $rawStatus, CourierStatus $expected) {
    pathaoConfig();

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => [
                'consignment_id' => 'CONSIGN-1',
                'order_status_slug' => $rawStatus,
            ],
        ]),
    ]);

    $result = (new PathaoCourierService)->getParcelStatus('CONSIGN-1');

    expect($result->status)->toBe($expected)
        ->and($result->rawStatus)->toBe($rawStatus);
})->with([
    'pending' => ['Pending', CourierStatus::Pending],
    'at sorting' => ['At Sorting', CourierStatus::AtSorting],
    'assigned for delivery' => ['Assigned for Delivery', CourierStatus::AssignedForDelivery],
    'at delivery hub' => ['At Delivery Hub', CourierStatus::AtDeliveryHub],
    'in transit' => ['In Transit', CourierStatus::InTransit],
    'on hold' => ['On Hold', CourierStatus::OnHold],
    'return requested' => ['Return Requested', CourierStatus::ReturnRequested],
    'reattempt requested' => ['Reattempt Requested', CourierStatus::ReattemptRequested],
    'delivery' => ['Delivery', CourierStatus::Delivery],
    'delivered (the raw text Pathao actually sends for this status)' => ['Delivered', CourierStatus::Delivery],
    'partial delivery' => ['Partial Delivery', CourierStatus::PartialDelivery],
    'exchange' => ['Exchange', CourierStatus::Exchange],
    'returned' => ['Returned', CourierStatus::Returned],
    'paid return' => ['Paid Return', CourierStatus::PaidReturn],
    'returned to inventory' => ['Returned to Inventory', CourierStatus::ReturnedToInventory],
    'assigned for return' => ['Assigned for Return', CourierStatus::AssignedForReturn],
    'first mile hub' => ['First Mile Hub', CourierStatus::FirstMileHub],
    'return to merchant' => ['Return to Merchant', CourierStatus::ReturnToMerchant],
    'pickup cancelled' => ['Pickup_Cancelled', CourierStatus::PickupCancelled],
    'unrecognized status falls back to Unknown' => ['Some_New_Status_Pathao_Might_Add', CourierStatus::Unknown],
]);

/**
 * Structural guard against the exact class of bug that let Pathao's raw
 * "Delivered" silently fall through to Unknown (see the dataset above): if
 * a future CourierStatus case is ever added without also adding a raw-text
 * mapping for it in PathaoCourierService::mapStatus(), this fails
 * immediately instead of only being caught by chance in production. It
 * can't catch an alternate real-world spelling nobody's seen yet (Pathao
 * doesn't document its full status vocabulary), only a case with zero
 * mapping at all - that gap is why CourierStatus::displayStatusLabel()
 * falls back to the humanized raw text instead of "Unknown".
 */
test('every courier status Pathao can actually report is reachable via its own canonical value', function (CourierStatus $status) {
    pathaoConfig();

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::response([
            'data' => ['consignment_id' => 'CONSIGN-1', 'order_status_slug' => $status->value],
        ]),
    ]);

    $result = (new PathaoCourierService)->getParcelStatus('CONSIGN-1');

    expect($result->status)->toBe($status);
})->with(array_filter(
    CourierStatus::cases(),
    fn (CourierStatus $status) => ! in_array($status, [CourierStatus::NotSubmitted, CourierStatus::Unknown], true),
));

test('it throws when store_id is not configured', function () {
    pathaoConfig(['store_id' => null]);

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    (new PathaoCourierService)->createParcel(sampleParcel());
})->throws(CourierException::class);

test('it surfaces Pathao\'s field-level validation errors instead of a generic message', function () {
    pathaoConfig();

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders' => Http::response([
            'message' => 'Please fix the given errors',
            'type' => 'error',
            'code' => 422,
            'errors' => ['store_id' => ['Wrong Store selected']],
        ], 422),
    ]);

    try {
        (new PathaoCourierService)->createParcel(sampleParcel());
    } catch (CourierException $exception) {
        expect($exception->getMessage())->toContain('store_id: Wrong Store selected');

        return;
    }

    $this->fail('Expected a CourierException to be thrown.');
});

test('cancelParcel is not supported since Pathao does not document a cancel endpoint', function () {
    pathaoConfig();

    (new PathaoCourierService)->cancelParcel('CONSIGN-1');
})->throws(CourierException::class);

test('a timeout fetching a parcel status throws CourierUnreachableException instead of a raw ConnectionException', function () {
    pathaoConfig();
    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders/CONSIGN-1/info' => Http::failedConnection('cURL error 28: Operation timed out'),
    ]);

    (new PathaoCourierService)->getParcelStatus('CONSIGN-1');
})->throws(CourierUnreachableException::class, 'Pathao did not respond in time.');

test('a timeout issuing an access token throws CourierUnreachableException', function () {
    pathaoConfig();

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::failedConnection('cURL error 28: Operation timed out'),
    ]);

    (new PathaoCourierService)->getParcelStatus('CONSIGN-1');
})->throws(CourierUnreachableException::class);

test('a timeout refreshing the token does not fall through to a second, password-grant attempt', function () {
    pathaoConfig();
    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'expired-token',
        'refresh_token' => 'refresh-token',
        'expires_at' => now()->subMinute(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::failedConnection('cURL error 28: Operation timed out'),
    ]);

    try {
        (new PathaoCourierService)->getParcelStatus('CONSIGN-1');
        $this->fail('Expected a CourierUnreachableException to be thrown.');
    } catch (CourierUnreachableException) {
        // Expected.
    }

    Http::assertSentCount(1);
});

test('a timeout creating a parcel warns the admin it may have been created before resubmitting', function () {
    pathaoConfig();
    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    Http::fake([
        '*/aladdin/api/v1/orders' => Http::failedConnection('cURL error 28: Operation timed out'),
    ]);

    (new PathaoCourierService)->createParcel(sampleParcel());
})->throws(CourierUnreachableException::class, 'unknown whether the parcel was created');
