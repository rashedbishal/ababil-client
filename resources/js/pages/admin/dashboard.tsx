import { Head, Link } from '@inertiajs/react';
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

export default function AdminDashboard({
    stats,
    range,
    recentOrders,
}: {
    stats: Stats;
    range: Range;
    recentOrders: RecentOrder[];
}) {
    const cards: { label: string; value: string | number }[] = [
        { label: 'Total Orders', value: stats.total_orders },
        { label: "Today's Orders", value: stats.todays_orders },
        { label: "Today's Visitors", value: stats.todays_visitors },
        { label: 'Total Products', value: stats.total_products },
        { label: 'Pending', value: stats.pending_orders },
        { label: 'Confirmed', value: stats.confirmed_orders },
        { label: 'Processing', value: stats.processing_orders },
        { label: 'Awaiting Courier', value: stats.awaiting_courier_orders },
        { label: 'Total Delivered', value: stats.delivered_orders },
        { label: 'Total Cancelled', value: stats.cancelled_orders },
        { label: 'Incomplete Checkouts', value: stats.incomplete_orders },
        { label: 'Total Revenue', value: `৳ ${stats.total_revenue}` },
    ];

    const rangeCards: { label: string; value: string | number }[] = [
        { label: 'Orders in range', value: range.order_count },
        { label: 'Total order value', value: `৳ ${range.order_total}` },
        { label: 'Amount received', value: `৳ ${range.amount_received}` },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <Heading
                title="Dashboard"
                description="An overview of your store."
            />

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-normal text-muted-foreground">
                                {card.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                            {card.value}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form
                        method="get"
                        className="flex flex-wrap items-end gap-3"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="from">From</Label>
                            <Input
                                id="from"
                                type="date"
                                name="from"
                                defaultValue={range.from}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="to">To</Label>
                            <Input
                                id="to"
                                type="date"
                                name="to"
                                defaultValue={range.to}
                            />
                        </div>
                        <Button type="submit" variant="secondary">
                            Apply
                        </Button>
                    </form>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {rangeCards.map((card) => (
                            <div
                                key={card.label}
                                className="rounded-lg border p-4"
                            >
                                <p className="text-sm text-muted-foreground">
                                    {card.label}
                                </p>
                                <p className="text-2xl font-semibold">
                                    {card.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground">
                            No orders yet.
                        </p>
                    )}

                    {/* Mobile: card list */}
                    <div className="grid gap-3 md:hidden">
                        {recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                href={orders.show(order.id)}
                                className="block rounded-lg border p-4"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="font-medium text-primary">
                                        {order.order_number}
                                    </span>
                                    <Badge variant="outline">
                                        {order.status}
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm">
                                    {order.customer_name}
                                </p>
                                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                                    <span>
                                        {order.created_at
                                            ? new Date(
                                                  order.created_at,
                                              ).toLocaleString()
                                            : '—'}
                                    </span>
                                    <span className="font-medium text-foreground">
                                        ৳ {order.grand_total}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Desktop: table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order #</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Placed</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <Link
                                                href={orders.show(order.id)}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {order.customer_name}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            ৳ {order.grand_total}
                                        </TableCell>
                                        <TableCell>
                                            {order.created_at
                                                ? new Date(
                                                      order.created_at,
                                                  ).toLocaleString()
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
