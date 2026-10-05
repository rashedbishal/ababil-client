<?php

namespace App\Support;

/**
 * Converts Bangla-Indic digits (০-৯) to their Western Arabic equivalents, so
 * a customer typing their phone number in Bangla still produces a value the
 * `01[3-9][0-9]{8}` format rules (frontend and backend alike) accept.
 */
class BanglaDigits
{
    private const MAP = [
        '০' => '0',
        '১' => '1',
        '২' => '2',
        '৩' => '3',
        '৪' => '4',
        '৫' => '5',
        '৬' => '6',
        '৭' => '7',
        '৮' => '8',
        '৯' => '9',
    ];

    public static function toEnglish(string $value): string
    {
        return strtr($value, self::MAP);
    }
}
