<?php

use App\Enums\FacebookEventLogStatus;
use App\Models\FacebookEventLog;
use App\Models\Order;
use App\Models\User;

test('an admin can view the meta event log', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    FacebookEventLog::query()->create([
        'order_id' => $order->id,
        'order_number' => $order->order_number,
        'event_name' => 'Purchase',
        'status' => FacebookEventLogStatus::Success,
        'http_status' => 200,
        'message' => '{"events_received":1}',
    ]);

    $response = $this->get(route('admin.meta-events.index'));

    $response->assertInertia(fn ($page) => $page
        ->where('logs.data.0.order_number', $order->order_number)
        ->where('logs.data.0.status', 'success'));
});

test('an admin can delete all event logs', function () {
    $this->actingAsAdmin();
    FacebookEventLog::query()->create([
        'event_name' => 'Purchase',
        'status' => FacebookEventLogStatus::Failed,
        'http_status' => 400,
        'message' => 'Invalid token',
    ]);
    FacebookEventLog::query()->create([
        'event_name' => 'Purchase',
        'status' => FacebookEventLogStatus::Success,
        'http_status' => 200,
    ]);

    $response = $this->delete(route('admin.meta-events.destroy-all'));

    $response->assertRedirect();
    expect(FacebookEventLog::query()->count())->toBe(0);
});

test('a non-admin cannot view or clear the meta event log', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.meta-events.index'))->assertForbidden();
    $this->actingAs($user)->delete(route('admin.meta-events.destroy-all'))->assertForbidden();
});
