import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Images,
    LayoutGrid,
    ListOrdered,
    Package,
    Rows3,
    Settings as SettingsIcon,
    ShoppingCart,
    Truck,
    Undo2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { home } from '@/routes';
import blockedIps from '@/routes/admin/blocked-ips';
import courier from '@/routes/admin/courier';
import { dashboard } from '@/routes/admin';
import incompleteOrders from '@/routes/admin/incomplete-orders';
import media from '@/routes/admin/media';
import orders from '@/routes/admin/orders';
import products from '@/routes/admin/products';
import settings from '@/routes/admin/settings';
import shippingAreas from '@/routes/admin/shipping-areas';
import sizes from '@/routes/admin/sizes';
import type { NavItem } from '@/types';

function buildGroups(pendingOrdersCount: number | null): {
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
                { title: 'Sizes', href: sizes.index(), icon: Rows3 },
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
            items: [{ title: 'Media', href: media.index(), icon: Images }],
        },
        {
            label: 'Security',
            items: [
                {
                    title: 'Blocked IPs',
                    href: blockedIps.index(),
                    icon: AlertTriangle,
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
    const { pendingOrdersCount } = usePage().props;
    const groups = buildGroups(pendingOrdersCount);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label} className="px-2 py-0">
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
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
                                        <SidebarMenuBadge className="bg-destructive text-white">
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
                            <Link href={home()}>
                                <span>View storefront</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
