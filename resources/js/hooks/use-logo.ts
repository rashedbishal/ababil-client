import { usePage } from '@inertiajs/react';
import defaultLogo from '../../images/landing/ababil-logo.webp';

/**
 * The logo for a place on the site: the one uploaded in the admin's Logo
 * Management, or the bundled brand mark when none has been uploaded.
 */
export function useLogo(slot: 'site' | 'admin'): string {
    const { logos } = usePage().props;

    return logos?.[slot] ?? defaultLogo;
}
