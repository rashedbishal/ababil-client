import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthBrandedLayout from '@/layouts/auth/auth-branded-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    // No default title for pages that don't set one, so the storefront keeps
    // the SEO <title> rendered server-side (see resources/views/app.blade.php).
    title: (title) => (title ? `${title} - ${appName}` : ''),
    layout: (name) => {
        switch (true) {
            case name === 'welcome' ||
                name === 'order-confirmation' ||
                name === 'concept-1' ||
                name === 'concept-2' ||
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
                {app}
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
