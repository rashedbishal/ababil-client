<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

/**
 * Rejects a value containing a URL or bare domain (http://, https://,
 * www., or a word.tld-shaped token) - checkout fields like name, address,
 * and notes are free text for a human to read, not a place to smuggle a
 * link through.
 */
class NoUrl implements ValidationRule
{
    private const PATTERN = '/(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|co|info|biz|xyz|bd|in|uk|us|me|ly|gl|app|dev|link|shop|store|online)\b)/i';

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && preg_match(self::PATTERN, $value) === 1) {
            $fail('The :attribute field must not contain a URL or website address.');
        }
    }
}
