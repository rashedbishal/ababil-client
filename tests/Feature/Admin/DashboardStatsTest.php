<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteVisit;

test('the dashboard reports total product count', function () {
    $this->actingAsAdmin();
    Product::factory()->count(3)->create();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.total_products', 3));
});

test('the dashboard reports the count of orders submitted to the courier', function () {
    $this->actingAsAdmin();

    Order::factory()->count(2)->create(['status' => OrderStatus::CourierSubmitted]);
    Order::factory()->create(['status' => OrderStatus::Shipped]);
    Order::factory()->create(['status' => OrderStatus::Pending]);

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.courier_submitted_orders', 2));
});

test('the dashboard reports the count of trashed orders', function () {
    $this->actingAsAdmin();

    Order::factory()->count(2)->create()->each->delete();
    Order::factory()->create();

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('stats.trashed_orders', 2));
});

test('the dashboard reports today\'s unique visitor count', function () {
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

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
    $this->actingAsAdmin();

    Order::factory()->create(['created_at' => today(), 'grand_total' => 50]);
    Order::factory()->create(['created_at' => today()->subDays(40), 'grand_total' => 999]);

    $this->get(route('admin.dashboard'))
        ->assertInertia(fn ($page) => $page->where('range.order_count', 1));
});

test('the dashboard builds a zero-filled daily series for the selected range', function () {
    $this->actingAsAdmin();

    Order::factory()->create(['created_at' => today()->subDays(2), 'grand_total' => 100.50, 'status' => OrderStatus::Delivered]);
    Order::factory()->create(['created_at' => today()->subDays(2), 'grand_total' => 150, 'status' => OrderStatus::Pending]);
    Order::factory()->create(['created_at' => today(), 'grand_total' => 200.25, 'status' => OrderStatus::Delivered]);

    $response = $this->get(route('admin.dashboard', [
        'from' => today()->subDays(2)->toDateString(),
        'to' => today()->toDateString(),
    ]));

    $response->assertInertia(fn ($page) => $page
        ->has('series', 3)
        ->where('series.0.date', today()->subDays(2)->toDateString())
        ->where('series.0.orders', 2)
        ->where('series.0.delivered', 1)
        ->where('series.0.revenue', 100.5)
        ->where('series.1.orders', 0)
        ->where('series.1.delivered', 0)
        ->where('series.1.revenue', 0)
        ->where('series.2.date', today()->toDateString())
        ->where('series.2.orders', 1)
        ->where('series.2.delivered', 1)
        ->where('series.2.revenue', 200.25));
});
