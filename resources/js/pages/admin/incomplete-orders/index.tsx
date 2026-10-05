import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Paginated } from '@/types';

type Row = {
    id: number;
    product_name: string | null;
    size_name: string | null;
    quantity: number | null;
    customer_name: string | null;
    customer_phone: string | null;
    shipping_area_name: string | null;
    customer_ip: string | null;
    conversion_status: string;
    last_activity_at: string | null;
};

export default function IncompleteOrdersIndex({
    incompleteOrders: paginated,
}: {
    incompleteOrders: Paginated<Row>;
}) {
    function remove(row: Row) {
        if (
            confirm(
                `Delete the incomplete checkout from "${row.customer_name ?? 'this visitor'}"?`,
            )
        ) {
            router.delete(incompleteOrders.destroy(row.id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Incomplete Orders" />

            <Heading
                title="Incomplete Orders"
                description="Customers who started checkout but did not complete it."
            />

            {paginated.data.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No incomplete checkouts recorded.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {paginated.data.map((row) => (
                    <div key={row.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-2">
                            <span className="font-medium">
                                {row.product_name ?? '—'}
                                {row.size_name ? ` (${row.size_name})` : ''}
                                {row.quantity ? ` × ${row.quantity}` : ''}
                            </span>
                            <Badge variant="secondary">
                                {row.conversion_status}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm">
                            {row.customer_name ?? '—'} ·{' '}
                            {row.customer_phone ?? '—'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {row.shipping_area_name ?? '—'} ·{' '}
                            {row.customer_ip ?? '—'}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                                {row.last_activity_at
                                    ? new Date(
                                          row.last_activity_at,
                                      ).toLocaleString()
                                    : '—'}
                            </span>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(row)}
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
                            <TableHead>Product</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead>IP</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last activity</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.data.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>
                                    {row.product_name ?? '—'}
                                    {row.size_name ? ` (${row.size_name})` : ''}
                                    {row.quantity ? ` × ${row.quantity}` : ''}
                                </TableCell>
                                <TableCell>
                                    {row.customer_name ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {row.customer_phone ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {row.shipping_area_name ?? '—'}
                                </TableCell>
                                <TableCell>{row.customer_ip ?? '—'}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {row.conversion_status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {row.last_activity_at
                                        ? new Date(
                                              row.last_activity_at,
                                          ).toLocaleString()
                                        : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(row)}
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
        </>
    );
}

IncompleteOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Incomplete Orders', href: incompleteOrders.index() },
    ],
};
