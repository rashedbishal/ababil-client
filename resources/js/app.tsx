import { createInertiaApp } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
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

// Same reasoning for Radix's Tooltip (and its floating-ui dependency) and
// sonner's Toaster: no storefront component ever renders a <Tooltip>, and
// only admin/auth/settings controllers ever flash a `toast` response - the
// storefront's own checkout flow flashes a different key and shows its
// result in an in-page modal, never sonner (grep app/Http/Controllers for
// `Inertia::flash('toast'` to confirm if this ever changes). Both are
// skipped below for STOREFRONT_PAGES, via the same `withApp` call that
// decides whether to mount them at all - so for those pages the dynamic
// import() backing each of these never fires, not just the render.
const TooltipProvider = lazy(() =>
    import('@/components/ui/tooltip').then((m) => ({
        default: m.TooltipProvider,
    })),
);
const Toaster = lazy(() =>
    import('@/components/ui/sonner').then((m) => ({ default: m.Toaster })),
);

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// The only pages rendered with no app chrome (`layout` below) and the only
// ones that never need TooltipProvider/Toaster (`withApp` below) - keep
// both in sync if that ever changes.
const STOREFRONT_PAGES = ['welcome', 'concept-3', 'order-confirmation'];

void createInertiaApp({
    // No default title for pages that don't set one, so the storefront keeps
    // the SEO <title> rendered server-side (see resources/views/app.blade.php).
    title: (title) => (title ? `${title} - ${appName}` : ''),
    layout: (name) => {
        switch (true) {
            case STOREFRONT_PAGES.includes(name):
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
    withApp(app, { page }) {
        // No layout, no Tooltip usage, no `toast` flash on these pages -
        // render as-is, with nothing extra to suspend on.
        if (STOREFRONT_PAGES.includes(page.component)) {
            return app;
        }

        return (
            <Suspense fallback={null}>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </Suspense>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
