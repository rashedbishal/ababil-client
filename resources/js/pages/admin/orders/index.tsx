import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { Paginated } from '@/types';

type OrderRow = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    status: string;
    status_label: string;
    grand_total: string;
    created_at: string | null;
};

type Filters = {
    status?: string;
    phone?: string;
    order_number?: string;
    from?: string;
    to?: string;
};

export default function OrdersIndex({
    orders: paginated,
    filters,
    statuses,
}: {
    orders: Paginated<OrderRow>;
    filters: Filters;
    statuses: { value: string; label: string }[];
}) {
    return (
        <>
            <Head title="Orders" />

            <Heading title="Orders" description="All customer orders." />

            <form method="get" className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        Order #
                    </label>
                    <Input
                        name="order_number"
                        defaultValue={filters.order_number ?? ''}
                        className="w-40"
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        Phone
                    </label>
                    <Input
                        name="phone"
                        defaultValue={filters.phone ?? ''}
                        className="w-40"
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        Status
                    </label>
                    <select
                        name="status"
                        defaultValue={filters.status ?? ''}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        From
                    </label>
                    <Input
                        type="date"
                        name="from"
                        defaultValue={filters.from ?? ''}
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">To</label>
                    <Input
                        type="date"
                        name="to"
                        defaultValue={filters.to ?? ''}
                    />
                </div>
                <Button type="submit" variant="secondary">
                    Filter
                </Button>
                <Button type="button" variant="ghost" asChild>
                    <Link href={orders.index()}>Reset</Link>
                </Button>
            </form>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Placed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginated.data.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No orders found.
                            </TableCell>
                        </TableRow>
                    )}
                    {paginated.data.map((order) => (
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
                            <TableCell>{order.customer_phone}</TableCell>
                            <TableCell>
                                <Badge variant="outline">
                                    {order.status_label}
                                </Badge>
                            </TableCell>
                            <TableCell>৳{order.grand_total}</TableCell>
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

            <Pagination links={paginated.links} />
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Orders', href: orders.index() },
    ],
};
