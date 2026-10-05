import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    Filter,
    Package,
    RotateCcw,
    ShoppingBag,
    Sparkles,
    Truck,
    Users,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import orders from '@/routes/admin/orders';

type Stats = {
    total_orders: number;
    todays_orders: number;
    todays_visitors: number;
    total_products: number;
    pending_orders: number;
    confirmed_orders: number;
    processing_orders: number;
    awaiting_courier_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    incomplete_orders: number;
    total_revenue: string;
};

type Range = {
    from: string;
    to: string;
    order_count: number;
    order_total: string;
    amount_received: string;
};

type RecentOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    status: string;
    grand_total: string;
    created_at: string | null;
};

function getStatusBadgeStyle(status: string) {
    const s = status.toLowerCase();
    if (s.includes('pending')) {
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
    }
    if (s.includes('confirmed')) {
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
    }
    if (s.includes('processing')) {
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20';
    }
    if (s.includes('awaiting')) {
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
    }
    if (s.includes('delivered')) {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
    }
    if (s.includes('cancel')) {
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
    }
    return 'bg-secondary text-secondary-foreground border-border/50';
}

export default function AdminDashboard({
    stats,
    range,
    recentOrders,
}: {
    stats: Stats;
    range: Range;
    recentOrders: RecentOrder[];
}) {
    const primaryCards = [
        {
            label: 'Total Revenue',
            value: `৳ ${stats.total_revenue}`,
            icon: DollarSign,
            gradient:
                'from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
            cardBorder: 'hover:border-emerald-500/40',
            subtitle: 'Lifetime earnings',
        },
        {
            label: "Today's Orders",
            value: stats.todays_orders,
            icon: ShoppingBag,
            gradient:
                'from-indigo-500/20 via-blue-500/10 to-transparent text-indigo-600 dark:text-indigo-400 ring-indigo-500/20',
            cardBorder: 'hover:border-indigo-500/40',
            subtitle: 'New orders placed today',
        },
        {
            label: 'Pending Action',
            value: stats.pending_orders,
            icon: Clock,
            gradient:
                'from-amber-500/20 via-orange-500/10 to-transparent text-amber-600 dark:text-amber-400 ring-amber-500/20',
            cardBorder: 'hover:border-amber-500/40',
            badge: stats.pending_orders > 0 ? 'Review Needed' : undefined,
            subtitle: 'Awaiting fulfillment',
        },
        {
            label: "Today's Visitors",
            value: stats.todays_visitors,
            icon: Users,
            gradient:
                'from-sky-500/20 via-cyan-500/10 to-transparent text-sky-600 dark:text-sky-400 ring-sky-500/20',
            cardBorder: 'hover:border-sky-500/40',
            subtitle: 'Unique active sessions',
        },
    ];

    const breakdownCards = [
        {
            label: 'Total Orders',
            value: stats.total_orders,
            icon: ShoppingBag,
            accent: 'border-l-indigo-500',
        },
        {
            label: 'Confirmed',
            value: stats.confirmed_orders,
            icon: CheckCircle2,
            accent: 'border-l-blue-500',
        },
        {
            label: 'Processing',
            value: stats.processing_orders,
            icon: RotateCcw,
            accent: 'border-l-indigo-500',
        },
        {
            label: 'Awaiting Courier',
            value: stats.awaiting_courier_orders,
            icon: Truck,
            accent: 'border-l-purple-500',
        },
        {
            label: 'Total Delivered',
            value: stats.delivered_orders,
            icon: CheckCircle2,
            accent: 'border-l-emerald-500',
        },
        {
            label: 'Total Cancelled',
            value: stats.cancelled_orders,
            icon: AlertCircle,
            accent: 'border-l-rose-500',
        },
        {
            label: 'Incomplete Checkouts',
            value: stats.incomplete_orders,
            icon: AlertCircle,
            accent: 'border-l-amber-500',
        },
        {
            label: 'Total Products',
            value: stats.total_products,
            icon: Package,
            accent: 'border-l-teal-500',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            {/* Top Welcome Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Heading
                            title="Dashboard"
                            description="Real-time overview of your store's sales and performance."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                        </span>
                        Store Online
                    </span>
                    <Link href={orders.index()}>
                        <Button
                            size="sm"
                            className="h-9 gap-1.5 font-medium shadow-xs"
                        >
                            <ShoppingBag className="size-3.5" />
                            Manage Orders
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Primary Elevated KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {primaryCards.map((card) => (
                    <Card
                        key={card.label}
                        className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.cardBorder}`}
                    >
                        <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent blur-xl transition-all group-hover:scale-125" />
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    {card.label}
                                </span>
                                <div
                                    className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-2xs ring-1 transition-transform duration-300 group-hover:scale-110`}
                                >
                                    <card.icon className="size-5" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-baseline justify-between">
                                <span className="text-3xl font-extrabold tracking-tight">
                                    {card.value}
                                </span>
                                {card.badge && (
                                    <span className="inline-flex animate-pulse items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                                        {card.badge}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {card.subtitle}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Status Breakdown Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        <Activity className="size-3.5 text-primary" />
                        Catalog & Status Metrics
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
                    {breakdownCards.map((card) => (
                        <div
                            key={card.label}
                            className={`flex flex-col justify-between rounded-xl border border-l-4 bg-card/80 p-3.5 shadow-2xs backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.accent}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="truncate text-xs font-medium text-muted-foreground">
                                    {card.label}
                                </span>
                                <card.icon className="size-3.5 shrink-0 text-muted-foreground/60" />
                            </div>
                            <span className="mt-2 text-xl font-bold tracking-tight">
                                {card.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sales Report Filter & Range Summary */}
            <Card className="overflow-hidden border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/60 bg-muted/30 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Filter className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-bold">
                                    Sales Performance Report
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    Analyze revenue and orders within custom
                                    date ranges
                                </p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-5">
                    <form
                        method="get"
                        className="flex flex-wrap items-end gap-4 rounded-xl border bg-muted/20 p-4"
                    >
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="from"
                                className="text-xs font-semibold text-muted-foreground"
                            >
                                Start Date
                            </Label>
                            <Input
                                id="from"
                                type="date"
                                name="from"
                                defaultValue={range.from}
                                className="h-9 w-44 text-xs font-medium shadow-2xs"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label
                                htmlFor="to"
                                className="text-xs font-semibold text-muted-foreground"
                            >
                                End Date
                            </Label>
                            <Input
                                id="to"
                                type="date"
                                name="to"
                                defaultValue={range.to}
                                className="h-9 w-44 text-xs font-medium shadow-2xs"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="h-9 gap-1.5 font-medium"
                        >
                            <Calendar className="size-3.5" />
                            Apply Range Filter
                        </Button>
                    </form>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent p-4 shadow-2xs">
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                Orders in Selected Range
                            </p>
                            <p className="mt-1 text-3xl font-extrabold tracking-tight">
                                {range.order_count}
                            </p>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-4 shadow-2xs">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                Gross Order Value
                            </p>
                            <p className="mt-1 text-3xl font-extrabold tracking-tight">
                                ৳ {range.order_total}
                            </p>
                        </div>
                        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 shadow-2xs">
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                Net Revenue Collected
                            </p>
                            <p className="mt-1 text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                                ৳ {range.amount_received}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders Table */}
            <Card className="overflow-hidden border-border/80 shadow-xs">
                <CardHeader className="border-b border-border/60 bg-muted/30 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="size-4" />
                            </div>
                            <CardTitle className="text-base font-bold">
                                Recent Store Orders
                            </CardTitle>
                        </div>
                        <Link
                            href={orders.index()}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                        >
                            View all orders
                            <ArrowUpRight className="size-3.5" />
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[140px] text-xs font-bold tracking-wider uppercase">
                                    Order #
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider uppercase">
                                    Customer Name
                                </TableHead>
                                <TableHead className="w-[140px] text-xs font-bold tracking-wider uppercase">
                                    Status
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider uppercase">
                                    Grand Total
                                </TableHead>
                                <TableHead className="text-xs font-bold tracking-wider uppercase">
                                    Order Date
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-36 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                            <ShoppingBag className="size-8 text-muted-foreground/40" />
                                            <p className="text-sm font-medium">
                                                No recent orders recorded yet
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentOrders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell className="font-bold">
                                            <Link
                                                href={orders.show(order.id)}
                                                className="inline-flex items-center gap-1 text-primary hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="font-semibold text-foreground">
                                            {order.customer_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`font-semibold capitalize ${getStatusBadgeStyle(order.status)}`}
                                            >
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-foreground">
                                            ৳ {order.grand_total}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {order.created_at
                                                ? new Date(
                                                      order.created_at,
                                                  ).toLocaleString(undefined, {
                                                      dateStyle: 'medium',
                                                      timeStyle: 'short',
                                                  })
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
