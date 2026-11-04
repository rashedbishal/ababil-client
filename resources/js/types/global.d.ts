import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare global {
    interface Window {
        // Populated by the GTM snippet an admin pastes into Settings → Head
        // code injection; not guaranteed to exist if nothing is configured.
        dataLayer?: unknown[];
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            pendingOrdersCount: number | null;
            sizeManagementEnabled: boolean;
            logos: { site: string | null; admin: string | null };
            [key: string]: unknown;
        };
    }
}
