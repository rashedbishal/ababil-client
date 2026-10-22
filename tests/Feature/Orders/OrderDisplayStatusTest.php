<?php

use App\Enums\OrderStatus;
use App\Models\Order;

test('a manual order displays its own status label', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Shipped,
        'status_sync_mode' => 'manual',
        'courier_status' => 'delivery',
        'courier_raw_status' => 'Delivery',
    ]);

    expect($order->displayStatusLabel())->toBe('Shipped');
});

test('an automated order displays the courier status label instead of the coarser order status', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Shipped,
        'status_sync_mode' => 'automated',
        'courier_status' => 'assigned_for_delivery',
        'courier_raw_status' => 'Assigned_for_Delivery',
    ]);

    expect($order->displayStatusLabel())->toBe('Assigned for Delivery');
});

test('an automated order falls back to a humanized raw courier status when the courier status is unrecognized', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Shipped,
        'status_sync_mode' => 'automated',
        'courier_status' => 'unknown',
        'courier_raw_status' => 'Some_New_Status',
    ]);

    expect($order->displayStatusLabel())->toBe('Some New Status');
});

test('an automated order with no courier status yet falls back to its own status label', function () {
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'status_sync_mode' => 'automated',
        'courier_status' => null,
        'courier_raw_status' => null,
    ]);

    expect($order->displayStatusLabel())->toBe('Pending');
});

test('needsCourierRefresh is true only for in-flight automated orders submitted to the courier', function () {
    $automatedInFlight = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => 'CONSIGN-1',
    ]);

    $manual = Order::factory()->create([
        'status' => OrderStatus::CourierSubmitted,
        'status_sync_mode' => 'manual',
        'courier_consignment_id' => 'CONSIGN-2',
    ]);

    $notSubmitted = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => null,
    ]);

    $delivered = Order::factory()->create([
        'status' => OrderStatus::Delivered,
        'status_sync_mode' => 'automated',
        'courier_consignment_id' => 'CONSIGN-3',
    ]);

    expect($automatedInFlight->needsCourierRefresh())->toBeTrue()
        ->and($manual->needsCourierRefresh())->toBeFalse()
        ->and($notSubmitted->needsCourierRefresh())->toBeFalse()
        ->and($delivered->needsCourierRefresh())->toBeFalse();
});
