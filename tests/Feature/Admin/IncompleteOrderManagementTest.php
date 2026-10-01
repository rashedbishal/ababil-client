<?php

use App\Models\IncompleteOrder;
use App\Models\User;

test('the incomplete orders index lists tracked checkout sessions', function () {
    $this->actingAsAdmin();

    IncompleteOrder::query()->create([
        'session_token' => 'session-1',
        'customer_name' => 'Jane Doe',
        'last_activity_at' => now(),
    ]);

    $this->get(route('admin.incomplete-orders.index'))
        ->assertInertia(fn ($page) => $page
            ->where('incompleteOrders.data.0.customer_name', 'Jane Doe'));
});

test('an admin can delete an incomplete order', function () {
    $this->actingAsAdmin();

    $incomplete = IncompleteOrder::query()->create([
        'session_token' => 'session-1',
        'customer_name' => 'Jane Doe',
        'last_activity_at' => now(),
    ]);

    $response = $this->delete(route('admin.incomplete-orders.destroy', $incomplete));

    $response->assertRedirect();
    expect(IncompleteOrder::query()->find($incomplete->id))->toBeNull();
});

test('a non-admin cannot delete an incomplete order', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $incomplete = IncompleteOrder::query()->create([
        'session_token' => 'session-1',
        'last_activity_at' => now(),
    ]);

    $response = $this->actingAs($user)->delete(route('admin.incomplete-orders.destroy', $incomplete));

    $response->assertForbidden();
    expect(IncompleteOrder::query()->find($incomplete->id))->not->toBeNull();
});
