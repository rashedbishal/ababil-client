import { Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    AlertTriangle,
    ExternalLink,
    LayoutGrid,
    ListOrdered,
    Package,
    Rows3,
    Settings as SettingsIcon,
    ShoppingCart,
    Trash2,
    Truck,
    Undo2,
    UserCog,
    Video,
} from 'lucide-react';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import ababilLogo from '../../images/landing/ababil-logo.webp';
import { home } from '@/routes';
import admins from '@/routes/admin/admins';
import blockedIps from '@/routes/admin/blocked-ips';
import courier from '@/routes/admin/courier';
import { dashboard } from '@/routes/admin';
import incompleteOrders from '@/routes/admin/incomplete-orders';
import orders from '@/routes/admin/orders';
import products from '@/routes/admin/products';
import reviews from '@/routes/admin/reviews';
import settings from '@/routes/admin/settings';
import shippingAreas from '@/routes/admin/shipping-areas';
import sizes from '@/routes/admin/sizes';
import type { NavItem } from '@/types';

function buildGroups(
    pendingOrdersCount: number | null,
    sizeManagementEnabled: boolean,
): {
    label: string;
    items: NavItem[];
}[] {
    return [
        {
            label: 'Overview',
            items: [
                { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
            ],
        },
        {
            label: 'Catalog',
            items: [
                { title: 'Products', href: products.index(), icon: Package },
                ...(sizeManagementEnabled
                    ? [
                          {
                              title: 'Sizes',
                              href: sizes.index(),
                              icon: Rows3,
                          },
                      ]
                    : []),
            ],
        },
        {
            label: 'Orders',
            items: [
                {
                    title: 'Orders',
                    href: orders.index(),
                    icon: ShoppingCart,
                    badge: pendingOrdersCount ?? undefined,
                },
                {
                    title: 'Incomplete Orders',
                    href: incompleteOrders.index(),
                    icon: ListOrdered,
                },
                {
                    title: 'Trashed Orders',
                    href: orders.trashed(),
                    icon: Trash2,
                },
            ],
        },
        {
            label: 'Operations',
            items: [
                {
                    title: 'Shipping Charges',
                    href: shippingAreas.index(),
                    icon: Truck,
                },
                {
                    title: 'Courier Integration',
                    href: courier.index(),
                    icon: Undo2,
                },
            ],
        },
        {
            label: 'Content',
            items: [
                {
                    title: 'Review Management',
                    href: reviews.index(),
                    icon: Video,
                },
            ],
        },
        {
            label: 'Security',
            items: [
                {
                    title: 'Blocked IPs',
                    href: blockedIps.index(),
                    icon: AlertTriangle,
                },
                {
                    title: 'Admin Management',
                    href: admins.index(),
                    icon: UserCog,
                },
            ],
        },
        {
            label: 'Configuration',
            items: [
                {
                    title: 'Settings',
                    href: settings.edit(),
                    icon: SettingsIcon,
                },
            ],
        },
    ];
}

export function AdminSidebar() {
    const { isCurrentUrl } = useCurrentUrl();
    const { pendingOrdersCount, sizeManagementEnabled, name } = usePage().props;
    const groups = buildGroups(pendingOrdersCount, sizeManagementEnabled);
    const { isMobile, setOpenMobile } = useSidebar();

    // On mobile the sidebar is a slide-over sheet, not a persistent rail -
    // picking a destination should close it like any other mobile nav
    // drawer, instead of leaving it open over the page that just loaded.
    useEffect(() => {
        return router.on('navigate', () => {
            if (isMobile) {
                setOpenMobile(false);
            }
        });
    }, [isMobile, setOpenMobile]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="group-data-[collapsible=icon]:p-0!"
                        >
                            <Link href={dashboard()}>
                                <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 shadow-2xs">
                                    <img
                                        src={ababilLogo}
                                        alt={name}
                                        className="size-full object-cover"
                                    />
                                </div>
                                <div className="ml-1 grid flex-1 text-left text-sm">
                                    <span className="mb-0.5 truncate leading-tight font-semibold">
                                        {name}
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label} className="px-2 py-0">
                        <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
                            {group.label}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {!!item.badge && (
                                        <SidebarMenuBadge className="border border-amber-500/20 bg-amber-500/15 font-semibold text-amber-700 dark:text-amber-300">
                                            {item.badge}
                                        </SidebarMenuBadge>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            tooltip={{ children: 'View the public storefront' }}
                        >
                            <Link
                                href={home()}
                                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                            >
                                <ExternalLink className="size-3.5" />
                                <span>View storefront</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser showSettingsLink={false} />
            </SidebarFooter>
        </Sidebar>
    );
}
