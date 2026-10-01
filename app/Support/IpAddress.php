<?php

namespace App\Support;

/**
 * Canonicalizes an IP address string so equivalent representations (a
 * compressed vs. expanded IPv6 literal, or an IPv4-mapped IPv6 address vs.
 * plain IPv4) always compare and store identically.
 */
class IpAddress
{
    public static function normalize(string $ip): string
    {
        $binary = @inet_pton($ip);

        if ($binary === false) {
            // Not a parseable IP at all - leave it untouched and let
            // whatever validation rule is in play (e.g. the 'ip' rule)
            // reject it instead of masking the problem here.
            return $ip;
        }

        // Collapse an IPv4-mapped IPv6 address (::ffff:a.b.c.d) down to
        // plain IPv4, so it normalizes the same way a proxy might present
        // it in either form.
        if (strlen($binary) === 16 && substr($binary, 0, 12) === "\0\0\0\0\0\0\0\0\0\0\xff\xff") {
            $binary = substr($binary, 12);
        }

        $canonical = inet_ntop($binary);

        return $canonical !== false ? $canonical : $ip;
    }
}
