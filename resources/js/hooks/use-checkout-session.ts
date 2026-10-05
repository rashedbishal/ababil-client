import { useState } from 'react';

const STORAGE_KEY = 'checkout_session_token';

/**
 * crypto.randomUUID() only exists in secure contexts (HTTPS or localhost),
 * so it is missing when the storefront is opened over plain HTTP on the LAN.
 * getRandomValues() is available everywhere, so build a v4 UUID from it.
 */
function createUuid(): string {
    if (typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0'),
    ).join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function readOrCreateToken(): string {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);

        if (existing) {
            return existing;
        }

        const token = createUuid();
        localStorage.setItem(STORAGE_KEY, token);

        return token;
    } catch {
        return createUuid();
    }
}

/**
 * A stable per-visitor checkout session token, used to correlate an
 * abandoned checkout (incomplete_orders) with the eventual order if the
 * customer completes it.
 *
 * `rotate()` starts a fresh token (and persists it, so a later page load
 * picks it up too) - pass an explicit token to adopt one the server already
 * picked (see below), or omit it to generate a new random one.
 *
 * Call it with no argument right after an order is placed - the checkout
 * form resets and lets the shopper place another order without reloading,
 * so without a new token any further tracking on this same page would keep
 * upserting the row that was just marked Converted, instead of creating a
 * new incomplete-order entry for the next attempt.
 *
 * The backend also rotates independently as a safety net: it has no way to
 * tell this is stale JS, so a visitor whose *stored* token already belongs
 * to an order they placed before this rotation existed (or before this
 * tab's JS ever ran the call above) would otherwise keep silently upserting
 * onto that already-converted row forever. The tracking response echoes
 * back whichever token it actually used, which the caller adopts here when
 * it differs from what was sent.
 */
export function useCheckoutSession(): [
    string,
    (explicitToken?: string) => string,
] {
    const [sessionToken, setSessionToken] = useState(readOrCreateToken);

    function rotate(explicitToken?: string): string {
        const token = explicitToken ?? createUuid();

        try {
            localStorage.setItem(STORAGE_KEY, token);
        } catch {
            // Storage unavailable - the token still rotates in memory for
            // the rest of this page's lifetime, just won't persist.
        }

        setSessionToken(token);

        return token;
    }

    return [sessionToken, rotate];
}
