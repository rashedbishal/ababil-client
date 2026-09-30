<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteVisit;
use App\Models\User;

function actingAsDashboardAdmin(): User
{
    $admin = User::factory()->create(['is_admin' => true]);
    test()->actingAs($admin);

    return $admin;
}

test('the dashboard reports total product count', function () {
    actingAsDashboardAdmin();
    Product::factory()->count(3)->create();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.total_products', 3));
});

test('the dashboard reports orders awaiting courier submission, excluding cancelled and returned orders', function () {
    actingAsDashboardAdmin();

    Order::factory()->create(['status' => OrderStatus::Pending, 'courier_consignment_id' => null]);
    Order::factory()->create(['status' => OrderStatus::Confirmed, 'courier_consignment_id' => null]);
    Order::factory()->create(['status' => OrderStatus::CourierSubmitted, 'courier_consignment_id' => 'CONSIGN-1']);
    Order::factory()->create(['status' => OrderStatus::Cancelled, 'courier_consignment_id' => null]);
    Order::factory()->create(['status' => OrderStatus::Returned, 'courier_consignment_id' => null]);

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.awaiting_courier_orders', 2));
});

test('the dashboard reports today\'s unique visitor count', function () {
    actingAsDashboardAdmin();

    SiteVisit::factory()->create(['session_token' => 'visitor-a', 'visited_on' => today()]);
    SiteVisit::factory()->create(['session_token' => 'visitor-b', 'visited_on' => today()]);
    SiteVisit::factory()->create(['session_token' => 'visitor-c', 'visited_on' => today()->subDay()]);

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.todays_visitors', 2));
});

test('visiting the storefront twice in the same session the same day only records one visit', function () {
    $this->post(route('site-visits.store'), ['session_token' => 'same-visitor']);
    $this->post(route('site-visits.store'), ['session_token' => 'same-visitor']);

    expect(SiteVisit::query()->where('session_token', 'same-visitor')->count())->toBe(1);
});

test('the same session visiting on a different day records a second visit', function () {
    SiteVisit::factory()->create(['session_token' => 'returning-visitor', 'visited_on' => today()->subDay()]);

    $this->post(route('site-visits.store'), ['session_token' => 'returning-visitor']);

    expect(SiteVisit::query()->where('session_token', 'returning-visitor')->count())->toBe(2);
});

test('the date-range report totals orders placed within the selected range', function () {
    actingAsDashboardAdmin();

    Order::factory()->create(['created_at' => today()->subDays(5), 'grand_total' => 100, 'status' => OrderStatus::Delivered]);
    Order::factory()->create(['created_at' => today()->subDays(3), 'grand_total' => 200, 'status' => OrderStatus::Pending]);
    Order::factory()->create(['created_at' => today()->subDays(20), 'grand_total' => 999, 'status' => OrderStatus::Delivered]);

    $response = $this->get(route('admin.dashboard', [
        'from' => today()->subDays(7)->toDateString(),
        'to' => today()->toDateString(),
    ]));

    $response->assertInertia(fn ($page) => $page
        ->where('range.order_count', 2)
        ->where('range.order_total', '300.00')
        ->where('range.amount_received', '100.00'));
});

test('the date-range report defaults to the last 30 days when no range is given', function () {
    actingAsDashboardAdmin();

    Order::factory()->create(['created_at' => today(), 'grand_total' => 50]);
    Order::factory()->create(['created_at' => today()->subDays(40), 'grand_total' => 999]);

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('range.order_count', 1));
});
