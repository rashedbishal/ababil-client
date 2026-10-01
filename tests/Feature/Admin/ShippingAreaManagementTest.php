<?php

use App\Models\ShippingArea;
use App\Models\User;

test('an admin can create a shipping area', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.shipping-areas.store'), [
        'name' => 'Dhaka Metro',
        'charge' => 70,
        'is_active' => true,
        'sort_order' => 1,
    ]);

    $response->assertRedirect();
    expect(ShippingArea::query()->where('name', 'Dhaka Metro')->exists())->toBeTrue();
});

test('an admin can update a shipping area', function () {
    $this->actingAsAdmin();
    $area = ShippingArea::factory()->create(['name' => 'Old Name', 'charge' => 50]);

    $response = $this->put(route('admin.shipping-areas.update', $area), [
        'name' => 'New Name',
        'charge' => 90,
        'is_active' => true,
        'sort_order' => 0,
    ]);

    $response->assertRedirect();
    expect($area->fresh()->name)->toBe('New Name')
        ->and((string) $area->fresh()->charge)->toBe('90.00');
});

test('an admin can delete a shipping area', function () {
    $this->actingAsAdmin();
    $area = ShippingArea::factory()->create();

    $response = $this->delete(route('admin.shipping-areas.destroy', $area));

    $response->assertRedirect();
    expect(ShippingArea::query()->find($area->id))->toBeNull();
});

test('a negative shipping charge is rejected', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.shipping-areas.store'), [
        'name' => 'Invalid Area',
        'charge' => -10,
    ]);

    $response->assertSessionHasErrors('charge');
    expect(ShippingArea::query()->where('name', 'Invalid Area')->exists())->toBeFalse();
});

test('a non-admin cannot manage shipping areas', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.shipping-areas.index'))->assertForbidden();
});
