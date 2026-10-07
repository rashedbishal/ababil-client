<?php

use App\Enums\CourierStatus;
use App\Enums\OrderStatus;

test('it maps a courier status to the implied order status', function (CourierStatus $courierStatus, ?OrderStatus $expected) {
    expect($courierStatus->toOrderStatus())->toBe($expected);
})->with([
    'pending stays courier submitted' => [CourierStatus::Pending, OrderStatus::CourierSubmitted],
    'at sorting stays courier submitted' => [CourierStatus::AtSorting, OrderStatus::CourierSubmitted],
    'in transit becomes shipped' => [CourierStatus::InTransit, OrderStatus::Shipped],
    'assigned for delivery becomes shipped' => [CourierStatus::AssignedForDelivery, OrderStatus::Shipped],
    'delivery becomes delivered' => [CourierStatus::Delivery, OrderStatus::Delivered],
    'partial delivery becomes delivered' => [CourierStatus::PartialDelivery, OrderStatus::Delivered],
    'returned becomes returned' => [CourierStatus::Returned, OrderStatus::Returned],
    'return in transit becomes returned' => [CourierStatus::ReturnInTransit, OrderStatus::Returned],
    'on hold does not change order status' => [CourierStatus::OnHold, null],
    'return requested does not change order status yet' => [CourierStatus::ReturnRequested, null],
    'pickup cancelled does not change order status' => [CourierStatus::PickupCancelled, null],
    'not submitted does not change order status' => [CourierStatus::NotSubmitted, null],
    'unknown does not change order status' => [CourierStatus::Unknown, null],
]);
