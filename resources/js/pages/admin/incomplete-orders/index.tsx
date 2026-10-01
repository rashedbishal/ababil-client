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
    order_number: string | null;
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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginated.data.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={8}
                                className="text-center text-muted-foreground"
                            >
                                No incomplete checkouts recorded.
                            </TableCell>
                        </TableRow>
                    )}
                    {paginated.data.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>
                                {row.product_name ?? '—'}
                                {row.size_name ? ` (${row.size_name})` : ''}
                                {row.quantity ? ` × ${row.quantity}` : ''}
                            </TableCell>
                            <TableCell>{row.customer_name ?? '—'}</TableCell>
                            <TableCell>{row.customer_phone ?? '—'}</TableCell>
                            <TableCell>
                                {row.shipping_area_name ?? '—'}
                            </TableCell>
                            <TableCell>{row.customer_ip ?? '—'}</TableCell>
                            <TableCell>
                                {row.conversion_status === 'Converted' ? (
                                    <Badge>
                                        {row.order_number
                                            ? `Converted (${row.order_number})`
                                            : 'Converted'}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        {row.conversion_status}
                                    </Badge>
                                )}
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
