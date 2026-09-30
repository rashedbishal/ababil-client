<?php

namespace App\Enums;

enum CourierStatus: string
{
    case NotSubmitted = 'not_submitted';
    case Submitted = 'submitted';
    case PickedUp = 'picked_up';
    case InTransit = 'in_transit';
    case Delivered = 'delivered';
    case Failed = 'failed';
    case Returned = 'returned';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::NotSubmitted => 'Not Submitted',
            self::Submitted => 'Submitted',
            self::PickedUp => 'Picked Up',
            self::InTransit => 'In Transit',
            self::Delivered => 'Delivered',
            self::Failed => 'Failed',
            self::Returned => 'Returned',
            self::Cancelled => 'Cancelled',
        };
    }
}
