<?php

use App\Enums\OrderStatus;
use App\Models\CourierProvider;
use App\Models\Order;
use App\Models\Setting;
use App\Support\CourierHealth;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

/**
 * Pathao timing out (cURL error 28) surfaces from Laravel's Http client as a
 * ConnectionException rather than a failed response. These pages refresh
 * courier statuses best-effort on every visit, so an unreachable courier
 * must degrade to "last known status" - never a 500.
 */
function configureUnreachablePathao(bool $parcelLookupsTimeOut = true): void
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

    Http::fake([
        '*/aladdin/api/v1/issue-token' => Http::response([
            'expires_in' => 432000,
            'access_token' => 'token',
            'refresh_token' => 'refresh',
        ]),
        '*/aladdin/api/v1/orders/*/info' => $parcelLookupsTimeOut
            ? Http::failedConnection('cURL error 28: Operation timed out after 8005 milliseconds with 0 bytes received')
            : Http::response(['data' => ['order_status_slug' => 'In_Transit']]),
    ]);
}

function inFlightPathaoOrder(string $consignmentId): Order
{
    return Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'courier_consignment_id' => $consignmentId,
        'courier_provider' => 'pathao',
    ]);
}

function parcelInfoRequestCount(): int
{
    return Http::recorded(fn (Request $request) => str_ends_with($request->url(), '/info'))->count();
}

test('the dashboard still loads when the courier times out, and stops polling after the first timeout', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();

    $first = inFlightPathaoOrder('CONSIGN-1');
    $second = inFlightPathaoOrder('CONSIGN-2');

    $this->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('recentOrders', 2));

    expect(parcelInfoRequestCount())->toBe(1)
        ->and($first->fresh()->status)->toBe(OrderStatus::CourierSubmitted)
        ->and($second->fresh()->status)->toBe(OrderStatus::CourierSubmitted);
});

test('the orders index still loads when the courier times out, and stops polling after the first timeout', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();

    inFlightPathaoOrder('CONSIGN-1');
    inFlightPathaoOrder('CONSIGN-2');

    $this->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('orders.data', 2));

    expect(parcelInfoRequestCount())->toBe(1);
});

test('the order page still loads when the courier times out', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();

    $order = inFlightPathaoOrder('CONSIGN-1');

    $this->get(route('admin.orders.show', $order))->assertOk();

    expect($order->fresh()->status)->toBe(OrderStatus::CourierSubmitted);
});

test('manually refreshing the courier status shows an error toast instead of a 500 when the courier times out', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();

    $order = inFlightPathaoOrder('CONSIGN-1');

    $this->from(route('admin.orders.show', $order))
        ->post(route('admin.orders.courier.refresh', $order))
        ->assertRedirect(route('admin.orders.show', $order));
});

test('a courier timeout flags the courier as unreachable', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();
    inFlightPathaoOrder('CONSIGN-1');

    $this->get(route('admin.dashboard'))->assertOk();

    expect(CourierHealth::isUnreachable())->toBeTrue();
});

test('while the courier is flagged unreachable, admin pages make no courier requests at all', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();
    CourierHealth::markUnreachable();

    $order = inFlightPathaoOrder('CONSIGN-1');

    $this->get(route('admin.dashboard'))->assertOk();
    $this->get(route('admin.orders.index'))->assertOk();
    $this->get(route('admin.orders.show', $order))->assertOk();

    Http::assertNothingSent();
});

test('submitting to the courier is rejected without contacting it while the courier is flagged unreachable', function () {
    $this->actingAsAdmin();
    configureUnreachablePathao();
    CourierHealth::markUnreachable();

    $order = Order::factory()->create(['status' => OrderStatus::Confirmed]);

    $this->from(route('admin.orders.show', $order))
        ->post(route('admin.orders.courier.submit', $order))
        ->assertRedirect(route('admin.orders.show', $order));

    Http::assertNothingSent();
    expect($order->fresh()->courier_consignment_id)->toBeNull();
});

test('any response from the courier clears the unreachable flag', function () {
    $this->actingAsAdmin();
    // The flag is still set from an earlier outage, but Pathao is back.
    configureUnreachablePathao(parcelLookupsTimeOut: false);
    CourierHealth::markUnreachable();

    $order = inFlightPathaoOrder('CONSIGN-OK');

    // Manual "Refresh status" still works while flagged - it doubles as a
    // way for an admin to retry the connection by hand.
    $this->post(route('admin.orders.courier.refresh', $order));

    expect(CourierHealth::isUnreachable())->toBeFalse();
});

test('the courier health shared prop reports a healthy courier with no alert', function () {
    $this->actingAsAdmin();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('courierHealth.unreachable', false)
            ->where('courierHealth.alert', false));
});

test('the unreachable alert shows once per login per outage', function () {
    $this->actingAsAdmin();
    CourierHealth::markUnreachable();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('courierHealth.unreachable', true)
            ->where('courierHealth.alert', true));

    $this->post(route('admin.courier.alert.dismiss'))->assertRedirect();

    // Dismissed: no modal for the rest of this login, but the outage
    // itself is still reported (the submit button stays disabled).
    $this->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page
            ->where('courierHealth.unreachable', true)
            ->where('courierHealth.alert', false));

    // Logging out invalidates the session - the next login sees it again.
    $this->flushSession();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('courierHealth.alert', true));
});

test('a new outage later in the same login shows the alert again', function () {
    $this->actingAsAdmin();
    CourierHealth::markUnreachable();

    $this->post(route('admin.courier.alert.dismiss'));

    CourierHealth::markReachable();
    $this->travel(10)->minutes();
    CourierHealth::markUnreachable();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('courierHealth.alert', true));
});
