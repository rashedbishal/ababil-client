<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Processing = 'processing';
    case CourierSubmitted = 'courier_submitted';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Returned = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Confirmed => 'Confirmed',
            self::Processing => 'Processing',
            self::CourierSubmitted => 'Courier Submitted',
            self::Shipped => 'Shipped',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Cancelled',
            self::Returned => 'Returned',
        };
    }

    /**
     * Statuses that count toward revenue/fulfilment metrics.
     *
     * @return array<int, self>
     */
    public static function active(): array
    {
        return [self::Pending, self::Confirmed, self::Processing, self::CourierSubmitted, self::Shipped, self::Delivered];
    }

    /**
     * Statuses that will never usefully change again via courier polling.
     *
     * @return array<int, self>
     */
    public static function terminal(): array
    {
        return [self::Cancelled, self::Returned, self::Delivered];
    }
}
