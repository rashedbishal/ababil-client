import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
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
    delivery_address: string | null;
    shipping_area_name: string | null;
    customer_ip: string | null;
    conversion_status: string;
    last_activity_at: string | null;
    can_convert: boolean;
};

// Mirrors PlaceOrderRequest's own rule for this field on the storefront -
// the backend is the authority, this is just early feedback so the button
// doesn't look active until a submission would actually pass.
const MIN_ADDRESS_LENGTH = 10;

export default function IncompleteOrdersIndex({
    incompleteOrders: paginated,
}: {
    incompleteOrders: Paginated<Row>;
}) {
    const [converting, setConverting] = useState<Row | null>(null);
    const form = useForm({ customer_name: '', delivery_address: '' });

    const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
    const [deleting, setDeleting] = useState(false);

    function confirmDelete() {
        // Without this guard, a double-click fires the request twice; the
        // second one can no longer find the already-deleted row and 404s
        // instead of silently no-oping.
        if (!pendingDelete || deleting) {
            return;
        }

        setDeleting(true);
        router.delete(incompleteOrders.destroy(pendingDelete.id).url, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setPendingDelete(null);
            },
        });
    }

    function openConvert(row: Row) {
        form.setData({
            customer_name: row.customer_name ?? '',
            delivery_address: row.delivery_address ?? '',
        });
        form.clearErrors();
        setConverting(row);
    }

    function submitConvert() {
        if (!converting) {
            return;
        }

        form.post(incompleteOrders.convert(converting.id).url, {
            preserveScroll: true,
            onSuccess: () => setConverting(null),
        });
    }

    const canSubmit =
        form.data.customer_name.trim().length > 0 &&
        form.data.delivery_address.trim().length >= MIN_ADDRESS_LENGTH;

    return (
        <>
            <Head title="Incomplete Orders" />

            <Heading
                title="Incomplete Orders"
                description="Customers who started checkout but did not complete it. Click a row to turn it into an order."
            />

            {paginated.data.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No incomplete checkouts recorded.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {paginated.data.map((row) => (
                    <div
                        key={row.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openConvert(row)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openConvert(row);
                            }
                        }}
                        className="cursor-pointer rounded-lg border p-4"
                    >
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingDelete(row);
                                }}
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
                            <TableRow
                                key={row.id}
                                onClick={() => openConvert(row)}
                                className="cursor-pointer"
                            >
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
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPendingDelete(row);
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

            <Dialog
                open={converting !== null}
                onOpenChange={(open) => !open && setConverting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Turn into an order</DialogTitle>
                        <DialogDescription>
                            {converting?.product_name ?? 'Product'}
                            {converting?.size_name
                                ? ` (${converting.size_name})`
                                : ''}
                            {converting?.quantity
                                ? ` × ${converting.quantity}`
                                : ''}
                            {' · '}
                            {converting?.customer_phone ?? 'No phone'}
                            {' · '}
                            {converting?.shipping_area_name ?? 'No area'}
                        </DialogDescription>
                    </DialogHeader>

                    {converting && !converting.can_convert ? (
                        <p className="text-sm text-muted-foreground">
                            This checkout is missing product, quantity, phone,
                            or shipping area information, so it can't be
                            converted into an order yet.
                        </p>
                    ) : (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="convert-customer-name">
                                    Name
                                </Label>
                                <Input
                                    id="convert-customer-name"
                                    value={form.data.customer_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'customer_name',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.customer_name}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="convert-delivery-address">
                                    Address
                                </Label>
                                <Textarea
                                    id="convert-delivery-address"
                                    rows={2}
                                    value={form.data.delivery_address}
                                    onChange={(e) =>
                                        form.setData(
                                            'delivery_address',
                                            e.target.value,
                                        )
                                    }
                                    minLength={MIN_ADDRESS_LENGTH}
                                    maxLength={200}
                                />
                                <InputError
                                    message={form.errors.delivery_address}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setConverting(null)}
                        >
                            Cancel
                        </Button>
                        {converting?.can_convert && (
                            <Button
                                type="button"
                                onClick={submitConvert}
                                disabled={!canSubmit || form.processing}
                            >
                                Turn into active order
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) =>
                    !open && !deleting && setPendingDelete(null)
                }
                title="Delete this incomplete checkout?"
                description={`The incomplete checkout from "${pendingDelete?.customer_name ?? 'this visitor'}" will be permanently deleted.`}
                confirmLabel="Delete"
                processing={deleting}
                onConfirm={confirmDelete}
            />
        </>
    );
}

IncompleteOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Incomplete Orders', href: incompleteOrders.index() },
    ],
};
