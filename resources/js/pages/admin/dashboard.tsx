import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    pending_orders: number;
    confirmed_orders: number;
    processing_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    incomplete_orders: number;
    total_revenue: string;
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
    recentOrders,
}: {
    stats: Stats;
    recentOrders: RecentOrder[];
}) {
    const cards: { label: string; value: string | number }[] = [
        { label: 'Total Orders', value: stats.total_orders },
        { label: "Today's Orders", value: stats.todays_orders },
        { label: 'Pending', value: stats.pending_orders },
        { label: 'Confirmed', value: stats.confirmed_orders },
        { label: 'Processing', value: stats.processing_orders },
        { label: 'Delivered', value: stats.delivered_orders },
        { label: 'Cancelled', value: stats.cancelled_orders },
        { label: 'Incomplete Checkouts', value: stats.incomplete_orders },
        { label: 'Total Revenue', value: `৳ ${stats.total_revenue}` },
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
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
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
                            {recentOrders.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-muted-foreground"
                                    >
                                        No orders yet.
                                    </TableCell>
                                </TableRow>
                            )}
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
                                    <TableCell>{order.customer_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>৳ {order.grand_total}</TableCell>
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
                </CardContent>
            </Card>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
