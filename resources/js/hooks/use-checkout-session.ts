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
 */
export function useCheckoutSession(): string {
    const [sessionToken] = useState(readOrCreateToken);

    return sessionToken;
}
