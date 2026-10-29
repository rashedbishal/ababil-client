import { createInertiaApp } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

// Lazy so the storefront (which uses none of these) never bundles admin's
// sidebar/nav chrome, settings' nav, or the auth layouts into its own
// initial JS - Lighthouse flagged these as unused bytes on the landing
// page. `layout` only needs to resolve to a component, and Inertia's own
// page resolution is already async, so a lazy layout just adds a Suspense
// boundary around the first render of whichever one a given route uses.
const AdminLayout = lazy(() => import('@/layouts/admin-layout'));
const AppLayout = lazy(() => import('@/layouts/app-layout'));
const AuthBrandedLayout = lazy(
    () => import('@/layouts/auth/auth-branded-layout'),
);
const AuthLayout = lazy(() => import('@/layouts/auth-layout'));
const SettingsLayout = lazy(() => import('@/layouts/settings/layout'));

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    // No default title for pages that don't set one, so the storefront keeps
    // the SEO <title> rendered server-side (see resources/views/app.blade.php).
    title: (title) => (title ? `${title} - ${appName}` : ''),
    layout: (name) => {
        switch (true) {
            case name === 'welcome' ||
                name === 'order-confirmation' ||
                name === 'concept-3':
                return null;
            case name === 'auth/login':
                return AuthBrandedLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <Suspense fallback={null}>{app}</Suspense>
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
