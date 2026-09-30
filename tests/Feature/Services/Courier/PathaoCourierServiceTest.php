<?php

use App\Enums\CourierStatus;
use App\Exceptions\CourierException;
use App\Models\CourierToken;
use App\Services\Courier\ParcelData;
use App\Services\Courier\PathaoCourierService;
use Illuminate\Support\Facades\Http;

function pathaoConfig(array $overrides = []): void
{
    config()->set('courier.providers.pathao', array_merge([
        'base_url' => 'https://courier-api-sandbox.pathao.com',
        'client_id' => 'test-client-id',
        'client_secret' => 'test-client-secret',
        'username' => 'test@pathao.com',
        'password' => 'lovePathao',
        'store_id' => 123,
        'delivery_type' => 48,
        'item_type' => 2,
    ], $overrides));
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
        ->and($result->status)->toBe(CourierStatus::Submitted)
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
    'delivered' => ['Delivered', CourierStatus::Delivered],
    'pending' => ['Pending', CourierStatus::Submitted],
    'picked up' => ['Picked_Up', CourierStatus::PickedUp],
    'in transit' => ['In_Transit', CourierStatus::InTransit],
    'cancelled' => ['Cancelled', CourierStatus::Cancelled],
    'unrecognized status falls back to Submitted' => ['Some_New_Status_Pathao_Might_Add', CourierStatus::Submitted],
]);

test('it throws when store_id is not configured', function () {
    pathaoConfig(['store_id' => null]);

    CourierToken::query()->create([
        'provider' => 'pathao',
        'access_token' => 'token',
        'expires_at' => now()->addDay(),
    ]);

    (new PathaoCourierService)->createParcel(sampleParcel());
})->throws(CourierException::class);

test('cancelParcel is not supported since Pathao does not document a cancel endpoint', function () {
    pathaoConfig();

    (new PathaoCourierService)->cancelParcel('CONSIGN-1');
})->throws(CourierException::class);
