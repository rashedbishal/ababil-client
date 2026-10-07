<?php

namespace App\Enums;

enum CourierStatus: string
{
    case NotSubmitted = 'not_submitted';
    case Pending = 'pending';
    case AtSorting = 'at_sorting';
    case FirstMileHub = 'first_mile_hub';
    case AssignedForDelivery = 'assigned_for_delivery';
    case AtDeliveryHub = 'at_delivery_hub';
    case InTransit = 'in_transit';
    case OnHold = 'on_hold';
    case ReattemptRequested = 'reattempt_requested';
    case PickupCancelled = 'pickup_cancelled';
    case Delivery = 'delivery';
    case PartialDelivery = 'partial_delivery';
    case Exchange = 'exchange';
    case ReturnRequested = 'return_requested';
    case ReturnAtSorting = 'return_at_sorting';
    case ReturnInTransit = 'return_in_transit';
    case AssignedForReturn = 'assigned_for_return';
    case ReturnToMerchant = 'return_to_merchant';
    case Returned = 'returned';
    case PaidReturn = 'paid_return';
    case ReturnedToInventory = 'returned_to_inventory';
    case ReprocessPending = 'reprocess_pending';
    case Reprocessed = 'reprocessed';
    case AtInventory = 'at_inventory';
    case Unknown = 'unknown';

    public function label(): string
    {
        return match ($this) {
            self::NotSubmitted => 'Not Submitted',
            self::Pending => 'Pending',
            self::AtSorting => 'At Sorting',
            self::FirstMileHub => 'First Mile Hub',
            self::AssignedForDelivery => 'Assigned for Delivery',
            self::AtDeliveryHub => 'At Delivery Hub',
            self::InTransit => 'In Transit',
            self::OnHold => 'On Hold',
            self::ReattemptRequested => 'Reattempt Requested',
            self::PickupCancelled => 'Pickup Cancelled',
            self::Delivery => 'Delivery',
            self::PartialDelivery => 'Partial Delivery',
            self::Exchange => 'Exchange',
            self::ReturnRequested => 'Return Requested',
            self::ReturnAtSorting => 'Return At Sorting',
            self::ReturnInTransit => 'Return In Transit',
            self::AssignedForReturn => 'Assigned for Return',
            self::ReturnToMerchant => 'Return to Merchant',
            self::Returned => 'Returned',
            self::PaidReturn => 'Paid Return',
            self::ReturnedToInventory => 'Returned to Inventory',
            self::ReprocessPending => 'Reprocess Pending',
            self::Reprocessed => 'Reprocessed',
            self::AtInventory => 'At Inventory',
            self::Unknown => 'Unknown',
        };
    }

    /**
     * The order status this courier status implies, used to sync `orders.status`
     * when an order's status_sync_mode is Automated. Null means "don't touch the
     * order status" - either the courier status is a terminal-ambiguous/needs-human
     * signal (On Hold, Return Requested, Pickup Cancelled) or it doesn't map to a
     * merchant-facing order status (NotSubmitted, Unknown).
     */
    public function toOrderStatus(): ?OrderStatus
    {
        return match ($this) {
            self::Pending, self::AtSorting, self::AtInventory, self::ReprocessPending, self::Reprocessed => OrderStatus::CourierSubmitted,
            self::FirstMileHub, self::AssignedForDelivery, self::AtDeliveryHub, self::InTransit, self::ReattemptRequested => OrderStatus::Shipped,
            self::Delivery, self::PartialDelivery, self::Exchange => OrderStatus::Delivered,
            self::ReturnAtSorting, self::ReturnInTransit, self::AssignedForReturn, self::ReturnToMerchant, self::Returned, self::PaidReturn, self::ReturnedToInventory => OrderStatus::Returned,
            self::NotSubmitted, self::OnHold, self::ReturnRequested, self::PickupCancelled, self::Unknown => null,
        };
    }
}
