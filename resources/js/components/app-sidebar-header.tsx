import { Link, usePage } from '@inertiajs/react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLogo } from '@/hooks/use-logo';
import { dashboard } from '@/routes/admin';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { name } = usePage().props;
    const ababilLogo = useLogo('admin');

    return (
        <header className="sticky top-0 z-30 grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-sidebar-border/50 bg-background px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Sidebar collapses to an off-canvas sheet on small screens, so
            the brand mark would otherwise disappear entirely when closed. */}
            <Link
                href={dashboard()}
                className="col-start-2 justify-self-center md:hidden"
            >
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg border border-border/50 shadow-2xs">
                    <img
                        src={ababilLogo}
                        alt={name}
                        className="size-full object-cover"
                    />
                </div>
            </Link>
        </header>
    );
}
