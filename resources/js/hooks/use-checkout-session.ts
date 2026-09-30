import { useState } from 'react';

const STORAGE_KEY = 'checkout_session_token';

function readOrCreateToken(): string {
    try {
        const existing = localStorage.getItem(STORAGE_KEY);

        if (existing) {
            return existing;
        }

        const token = crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, token);

        return token;
    } catch {
        return crypto.randomUUID();
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
