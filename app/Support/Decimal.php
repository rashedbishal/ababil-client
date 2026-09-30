<?php

namespace App\Support;

use UnexpectedValueException;

/**
 * Validates that a decimal-cast Eloquent attribute is genuinely numeric
 * before it is handed to bcmath, and gives that value's type the precision
 * bcmath's function signatures require.
 */
final class Decimal
{
    /**
     * @return numeric-string
     */
    public static function of(string $value): string
    {
        if (! is_numeric($value)) {
            throw new UnexpectedValueException("Expected a numeric decimal value, got: {$value}");
        }

        return $value;
    }
}
