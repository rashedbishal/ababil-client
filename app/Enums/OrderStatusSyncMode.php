<?php

namespace App\Enums;

enum OrderStatusSyncMode: string
{
    case Automated = 'automated';
    case Manual = 'manual';

    public function label(): string
    {
        return match ($this) {
            self::Automated => 'Automated',
            self::Manual => 'Manual',
        };
    }
}
