<?php

use App\Models\Order;
use App\Models\User;

test('the orders index paginates 15 orders per page', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $this->actingAs($admin);

    Order::factory()->count(17)->create();

    $this->get(route('admin.orders.index'))
        ->assertInertia(fn ($page) => $page
            ->where('orders.data', fn ($data) => count($data) === 15)
            ->where('orders.per_page', 15)
            ->where('orders.total', 17)
            ->where('orders.last_page', 2));
});
