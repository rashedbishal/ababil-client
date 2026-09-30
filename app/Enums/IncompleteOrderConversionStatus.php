<?php

namespace App\Enums;

enum IncompleteOrderConversionStatus: string
{
    case Pending = 'pending';
    case Converted = 'converted';
    case Abandoned = 'abandoned';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Converted => 'Converted',
            self::Abandoned => 'Abandoned',
        };
    }
}
