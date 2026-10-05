<?php

use App\Models\IncompleteOrder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;

test('an admin can move an order to trash', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $response = $this->delete(route('admin.orders.destroy', $order));

    $response->assertRedirect();
    expect(Order::query()->find($order->id))->toBeNull()
        ->and(Order::withTrashed()->find($order->id))->not->toBeNull()
        ->and(Order::withTrashed()->find($order->id)->trashed())->toBeTrue();
});

test('a trashed order disappears from the normal orders index but appears in trashed orders', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    $order->delete();

    $this->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page
            ->where('orders.data', fn ($data) => count($data) === 0));

    $this->get(route('admin.orders.trashed'))
        ->assertInertia(fn ($page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.id', $order->id));
});

test('trashing an order keeps its items and status history intact', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    $item = OrderItem::factory()->create(['order_id' => $order->id]);

    $order->delete();

    expect(OrderItem::query()->find($item->id))->not->toBeNull();
});

test('an admin can restore a trashed order', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    $order->delete();

    $response = $this->post(route('admin.orders.restore', $order->id));

    $response->assertRedirect();
    expect(Order::query()->find($order->id))->not->toBeNull()
        ->and(Order::query()->find($order->id)->trashed())->toBeFalse();
});

test('an admin can permanently delete a trashed order', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    $item = OrderItem::factory()->create(['order_id' => $order->id]);
    $order->delete();

    $response = $this->delete(route('admin.orders.force-delete', $order->id));

    $response->assertRedirect();
    expect(Order::withTrashed()->find($order->id))->toBeNull()
        ->and(OrderItem::query()->find($item->id))->toBeNull();
});

test('permanently deleting an order nulls out its linked incomplete order instead of deleting that row', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    $incomplete = IncompleteOrder::query()->create([
        'session_token' => 'some-session',
        'customer_phone' => $order->customer_phone,
        'order_id' => $order->id,
    ]);
    $order->delete();

    $this->delete(route('admin.orders.force-delete', $order->id));

    expect(IncompleteOrder::query()->find($incomplete->id)?->order_id)->toBeNull();
});

test('restoring an order that is not actually trashed fails', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $this->post(route('admin.orders.restore', $order->id))->assertNotFound();
});

test('permanently deleting an order that is not actually trashed fails', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $this->delete(route('admin.orders.force-delete', $order->id))->assertNotFound();
});

test('a trashed order is no longer viewable on its normal admin show page', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();
    $order->delete();

    $this->get(route('admin.orders.show', $order->id))->assertNotFound();
});

test('a trashed order no longer shows up on the customer-facing confirmation page', function () {
    $order = Order::factory()->create();
    $order->delete();

    $this->get(route('orders.confirmation', $order->order_number))->assertNotFound();
});

test('an admin can clear all trashed orders at once', function () {
    $this->actingAsAdmin();
    $trashed = Order::factory()->count(3)->create();
    $item = OrderItem::factory()->create(['order_id' => $trashed->first()->id]);
    $untouched = Order::factory()->create();

    foreach ($trashed as $order) {
        $order->delete();
    }

    $response = $this->delete(route('admin.orders.clear-trash'));

    $response->assertRedirect();
    expect(Order::withTrashed()->whereIn('id', $trashed->pluck('id'))->count())->toBe(0)
        ->and(OrderItem::query()->find($item->id))->toBeNull()
        ->and(Order::query()->find($untouched->id))->not->toBeNull();
});

test('clearing trash when nothing is trashed does nothing and does not error', function () {
    $this->actingAsAdmin();
    $order = Order::factory()->create();

    $response = $this->delete(route('admin.orders.clear-trash'));

    $response->assertRedirect();
    expect(Order::query()->find($order->id))->not->toBeNull();
});

test('a non-admin cannot trash, restore, permanently delete, or clear trashed orders', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $order = Order::factory()->create();

    $this->actingAs($user)->delete(route('admin.orders.destroy', $order))->assertForbidden();

    $order->delete();

    $this->actingAs($user)->post(route('admin.orders.restore', $order->id))->assertForbidden();
    $this->actingAs($user)->delete(route('admin.orders.force-delete', $order->id))->assertForbidden();
    $this->actingAs($user)->delete(route('admin.orders.clear-trash'))->assertForbidden();
});

test('a guest cannot trash, restore, or permanently delete an order', function () {
    $order = Order::factory()->create();

    $this->delete(route('admin.orders.destroy', $order))->assertRedirect(route('login'));
});
