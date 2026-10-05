import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
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
    is_new: boolean;
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
    const [orderNumber, setOrderNumber] = useState(filters.order_number ?? '');
    const [phone, setPhone] = useState(filters.phone ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    // Skip the effect on mount - the page already rendered with these
    // filters applied server-side, so re-requesting the same query on load
    // would just be a wasted round trip.
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                orders.index().url,
                {
                    order_number: orderNumber || undefined,
                    phone: phone || undefined,
                    status: status || undefined,
                    from: from || undefined,
                    to: to || undefined,
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
            // Short debounce so free-text typing doesn't fire a request per
            // keystroke; a status/date change settles into it just as fast
            // since there's nothing further to type.
        }, 350);

        return () => clearTimeout(timeout);
    }, [orderNumber, phone, status, from, to]);

    function reset() {
        setOrderNumber('');
        setPhone('');
        setStatus('');
        setFrom('');
        setTo('');
    }

    const [pendingDelete, setPendingDelete] = useState<OrderRow | null>(null);

    function confirmDelete() {
        if (!pendingDelete) {
            return;
        }

        router.delete(orders.destroy(pendingDelete.id).url, {
            preserveScroll: true,
            onFinish: () => setPendingDelete(null),
        });
    }

    return (
        <>
            <Head title="Orders" />

            <Heading title="Orders" description="All customer orders." />

            <div className="flex flex-wrap items-end gap-2">
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        Order #
                    </label>
                    <Input
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="w-40"
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        Phone
                    </label>
                    <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-40"
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">
                        Status
                    </label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
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
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                </div>
                <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">To</label>
                    <Input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                </div>
                <Button type="button" variant="ghost" onClick={reset}>
                    Reset
                </Button>
            </div>

            {paginated.data.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No orders found.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {paginated.data.map((order) => (
                    <div key={order.id} className="rounded-lg border">
                        <Link
                            href={orders.show(order.id)}
                            className="block p-4"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span
                                    className={`text-primary ${order.is_new ? 'font-bold' : 'font-medium'}`}
                                >
                                    {order.order_number}
                                </span>
                                <Badge variant="outline">
                                    {order.status_label}
                                </Badge>
                            </div>
                            <p
                                className={`mt-1 text-sm ${order.is_new ? 'font-bold' : ''}`}
                            >
                                {order.customer_name} · {order.customer_phone}
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
                                    ৳{order.grand_total}
                                </span>
                            </div>
                        </Link>
                        <div className="flex justify-end border-t px-4 py-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setPendingDelete(order)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead className="max-w-[140px]">
                                Customer
                            </TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Placed</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.data.map((order) => (
                            <TableRow
                                key={order.id}
                                onClick={() =>
                                    router.visit(orders.show(order.id).url)
                                }
                                className={`cursor-pointer ${order.is_new ? 'font-bold' : ''}`}
                            >
                                <TableCell>
                                    <Link
                                        href={orders.show(order.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`text-primary hover:underline ${order.is_new ? 'font-bold' : 'font-medium'}`}
                                    >
                                        {order.order_number}
                                    </Link>
                                </TableCell>
                                <TableCell
                                    className="max-w-[140px] truncate"
                                    title={order.customer_name}
                                >
                                    {order.customer_name}
                                </TableCell>
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
                                <TableCell className="text-right">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingDelete(order);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination links={paginated.links} />

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => !open && setPendingDelete(null)}
                title="Move order to trash?"
                description={
                    pendingDelete
                        ? `Order "${pendingDelete.order_number}" will be moved to trash. You can restore it later from Trashed Orders.`
                        : undefined
                }
                confirmLabel="Move to trash"
                onConfirm={confirmDelete}
            />
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Orders', href: orders.index() },
    ],
};
