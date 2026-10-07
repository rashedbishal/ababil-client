import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    BarChart3,
    Calendar as CalendarIcon,
    CheckCircle2,
    Clock,
    DollarSign,
    type LucideIcon,
    Package,
    Send,
    ShoppingBag,
    Sparkles,
    Trash2,
    Users,
} from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { DatePicker } from '@/components/date-picker';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import incompleteOrders from '@/routes/admin/incomplete-orders';
import orders from '@/routes/admin/orders';
import products from '@/routes/admin/products';

type Stats = {
    total_orders: number;
    todays_orders: number;
    todays_visitors: number;
    total_products: number;
    pending_orders: number;
    confirmed_orders: number;
    courier_submitted_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    trashed_orders: number;
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

type SeriesPoint = {
    date: string;
    orders: number;
    delivered: number;
    revenue: number;
};

function formatChartDate(value: string) {
    return new Date(value).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
}

function compactNumber(value: number) {
    return new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

function ChartTooltip({
    active,
    payload,
    label,
    formatValue = (value) => String(value),
}: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
    formatValue?: (value: number) => string;
}) {
    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md">
            <p className="font-medium text-popover-foreground">
                {label ? formatChartDate(label) : ''}
            </p>
            <p className="text-muted-foreground">
                {formatValue(payload[0].value)}
            </p>
        </div>
    );
}

function ChartCard({
    title,
    data,
    dataKey,
    colorClassName,
    formatValue,
    yTickFormatter = compactNumber,
    allowDecimals = true,
    className,
}: {
    title: string;
    data: SeriesPoint[];
    dataKey: keyof SeriesPoint;
    colorClassName: string;
    formatValue?: (value: number) => string;
    yTickFormatter?: (value: number) => string;
    allowDecimals?: boolean;
    className?: string;
}) {
    const axisTick = {
        fontSize: 10,
        fill: 'var(--color-muted-foreground)',
    };

    return (
        <div
            className={`flex flex-col gap-2 rounded-lg border bg-card/80 p-3 shadow-2xs ${className ?? ''}`}
        >
            <p className="text-xs font-semibold text-muted-foreground">
                {title}
            </p>
            <div className={`min-h-32 flex-1 ${colorClassName}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            vertical={false}
                            stroke="var(--color-border)"
                        />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatChartDate}
                            tick={axisTick}
                            tickLine={false}
                            axisLine={{ stroke: 'var(--color-border)' }}
                            minTickGap={28}
                        />
                        <YAxis
                            tickFormatter={yTickFormatter}
                            tick={axisTick}
                            tickLine={false}
                            axisLine={false}
                            width={36}
                            allowDecimals={allowDecimals}
                        />
                        <RechartsTooltip
                            content={<ChartTooltip formatValue={formatValue} />}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke="currentColor"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

type PrimaryCardConfig = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    gradient: string;
    cardBorder: string;
    subtitle: string;
    badge?: string;
    href?: string;
};

function PrimaryCard({ card }: { card: PrimaryCardConfig }) {
    const content = (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${card.cardBorder}`}
        >
            <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-br from-primary/5 to-transparent blur-xl transition-all group-hover:scale-125" />
            <CardContent className="p-3.5 sm:p-5">
                <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        {card.label}
                    </span>
                    <div
                        className={`flex size-8 items-center justify-center rounded-xl bg-gradient-to-br sm:size-10 ${card.gradient} shadow-2xs ring-1 transition-transform duration-300 group-hover:scale-110`}
                    >
                        <card.icon className="size-4 sm:size-5" />
                    </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between sm:mt-4">
                    <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                        {card.value}
                    </span>
                    {card.badge && (
                        <span className="inline-flex animate-pulse items-center rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                            {card.badge}
                        </span>
                    )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1">
                    {card.subtitle}
                </p>
            </CardContent>
        </Card>
    );

    return card.href ? (
        <Link href={card.href} className="block">
            {content}
        </Link>
    ) : (
        content
    );
}

type BreakdownCardConfig = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    accent: string;
    href?: string;
};

function BreakdownCard({ card }: { card: BreakdownCardConfig }) {
    const content = (
        <div
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
    );

    return card.href ? (
        <Link href={card.href} className="block">
            {content}
        </Link>
    ) : (
        content
    );
}

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
    series,
    recentOrders,
}: {
    stats: Stats;
    range: Range;
    series: SeriesPoint[];
    recentOrders: RecentOrder[];
}) {
    const [rangeFrom, setRangeFrom] = useState(range.from);
    const [rangeTo, setRangeTo] = useState(range.to);

    function applyRange(e: React.FormEvent) {
        e.preventDefault();

        // A plain GET <form> does a full browser navigation, which resets
        // scroll position and loses focus - router.get() keeps this an
        // in-place Inertia visit instead.
        router.get(
            dashboard().url,
            { from: rangeFrom, to: rangeTo },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    const primaryCards: PrimaryCardConfig[] = [
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
            href: orders.index({ query: { status: 'pending' } }).url,
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
        {
            label: 'Total Revenue',
            value: `৳ ${stats.total_revenue}`,
            icon: DollarSign,
            gradient:
                'from-emerald-500/20 via-teal-500/10 to-transparent text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
            cardBorder: 'hover:border-emerald-500/40',
            subtitle: 'Lifetime earnings',
        },
    ];

    const breakdownCards: BreakdownCardConfig[] = [
        {
            label: 'Total Orders',
            value: stats.total_orders,
            icon: ShoppingBag,
            accent: 'border-l-indigo-500',
            href: orders.index().url,
        },
        {
            label: 'Confirmed',
            value: stats.confirmed_orders,
            icon: CheckCircle2,
            accent: 'border-l-blue-500',
            href: orders.index({ query: { status: 'confirmed' } }).url,
        },
        {
            label: 'Courier Submitted',
            value: stats.courier_submitted_orders,
            icon: Send,
            accent: 'border-l-violet-500',
            href: orders.index({ query: { status: 'courier_submitted' } }).url,
        },
        {
            label: 'Trashed Orders',
            value: stats.trashed_orders,
            icon: Trash2,
            accent: 'border-l-purple-500',
            href: orders.trashed().url,
        },
        {
            label: 'Total Delivered',
            value: stats.delivered_orders,
            icon: CheckCircle2,
            accent: 'border-l-emerald-500',
            href: orders.index({ query: { status: 'delivered' } }).url,
        },
        {
            label: 'Total Cancelled',
            value: stats.cancelled_orders,
            icon: AlertCircle,
            accent: 'border-l-rose-500',
            href: orders.index({ query: { status: 'cancelled' } }).url,
        },
        {
            label: 'Incomplete Checkouts',
            value: stats.incomplete_orders,
            icon: AlertCircle,
            accent: 'border-l-amber-500',
            href: incompleteOrders.index().url,
        },
        {
            label: 'Total Products',
            value: stats.total_products,
            icon: Package,
            accent: 'border-l-teal-500',
            href: products.index().url,
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

            {/* KPI overview (left) + Store Analytics (right) */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                {/* Left column: Primary KPI cards + Status Breakdown Grid */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {primaryCards.map((card) => (
                            <PrimaryCard key={card.label} card={card} />
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
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {breakdownCards.map((card) => (
                                <BreakdownCard key={card.label} card={card} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right column: date-range filter, range summary, and trend charts */}
                <Card className="gap-0 overflow-hidden border-border/80 py-0 shadow-xs">
                    <CardHeader className="border-b border-border/60 bg-muted/30 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <BarChart3 className="size-3.5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-bold">
                                        Store Analytics
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Analyze revenue and orders within custom
                                        date ranges
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4">
                        <form
                            onSubmit={applyRange}
                            className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/20 p-3"
                        >
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="from"
                                    className="text-xs font-semibold text-muted-foreground"
                                >
                                    Start Date
                                </Label>
                                <DatePicker
                                    id="from"
                                    value={rangeFrom}
                                    onChange={setRangeFrom}
                                    className="h-8 text-xs font-medium shadow-2xs"
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label
                                    htmlFor="to"
                                    className="text-xs font-semibold text-muted-foreground"
                                >
                                    End Date
                                </Label>
                                <DatePicker
                                    id="to"
                                    value={rangeTo}
                                    onChange={setRangeTo}
                                    className="h-8 text-xs font-medium shadow-2xs"
                                />
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 gap-1.5 font-medium"
                            >
                                <CalendarIcon className="size-3.5" />
                                Apply Range Filter
                            </Button>
                        </form>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="relative overflow-hidden rounded-lg border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent p-3 shadow-2xs">
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                    Orders in Selected Range
                                </p>
                                <p className="mt-0.5 text-2xl font-extrabold tracking-tight">
                                    {range.order_count}
                                </p>
                            </div>
                            <div className="relative overflow-hidden rounded-lg border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-3 shadow-2xs">
                                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    Gross Order Value
                                </p>
                                <p className="mt-0.5 text-2xl font-extrabold tracking-tight">
                                    ৳ {range.order_total}
                                </p>
                            </div>
                            <div className="relative overflow-hidden rounded-lg border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent p-3 shadow-2xs">
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    Net Revenue Collected
                                </p>
                                <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                                    ৳ {range.amount_received}
                                </p>
                            </div>
                        </div>

                        {/* Trend charts: total orders (large) + deliveries / net revenue (stacked) */}
                        <div className="grid grid-cols-2 grid-rows-2 gap-3">
                            <ChartCard
                                title="Chart of Total Orders"
                                data={series}
                                dataKey="orders"
                                colorClassName="text-indigo-600 dark:text-indigo-400"
                                allowDecimals={false}
                                className="row-span-2"
                            />
                            <ChartCard
                                title="Chart of Total Deliveries"
                                data={series}
                                dataKey="delivered"
                                colorClassName="text-emerald-600 dark:text-emerald-400"
                                allowDecimals={false}
                            />
                            <ChartCard
                                title="Chart of Net Revenue"
                                data={series}
                                dataKey="revenue"
                                colorClassName="text-blue-600 dark:text-blue-400"
                                formatValue={(value) => `৳ ${value.toFixed(2)}`}
                                yTickFormatter={(value) =>
                                    `৳${compactNumber(value)}`
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                    {recentOrders.length === 0 ? (
                        <div className="flex h-36 flex-col items-center justify-center gap-1.5 text-center text-muted-foreground">
                            <ShoppingBag className="size-8 text-muted-foreground/40" />
                            <p className="text-sm font-medium">
                                No recent orders recorded yet
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile: card list */}
                            <div className="grid gap-3 p-4 md:hidden">
                                {recentOrders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={orders.show(order.id)}
                                        className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="font-bold text-primary">
                                                {order.order_number}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`font-semibold capitalize ${getStatusBadgeStyle(order.status)}`}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>
                                        <p className="mt-1 text-sm font-semibold text-foreground">
                                            {order.customer_name}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>
                                                {order.created_at
                                                    ? new Date(
                                                          order.created_at,
                                                      ).toLocaleString(
                                                          undefined,
                                                          {
                                                              dateStyle:
                                                                  'medium',
                                                              timeStyle:
                                                                  'short',
                                                          },
                                                      )
                                                    : '—'}
                                            </span>
                                            <span className="font-bold text-foreground">
                                                ৳ {order.grand_total}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Desktop: table */}
                            <div className="hidden md:block">
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
                                        {recentOrders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <TableCell className="font-bold">
                                                    <Link
                                                        href={orders.show(
                                                            order.id,
                                                        )}
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
                                                          ).toLocaleString(
                                                              undefined,
                                                              {
                                                                  dateStyle:
                                                                      'medium',
                                                                  timeStyle:
                                                                      'short',
                                                              },
                                                          )
                                                        : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
