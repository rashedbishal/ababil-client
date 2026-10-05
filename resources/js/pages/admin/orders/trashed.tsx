import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
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
import orders from '@/routes/admin/orders';
import type { Paginated } from '@/types';

type TrashedOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    status_label: string;
    grand_total: string;
    deleted_at: string | null;
};

type PendingAction =
    | { type: 'restore'; order: TrashedOrder }
    | { type: 'delete'; order: TrashedOrder }
    | { type: 'clear' };

export default function TrashedOrdersIndex({
    orders: paginated,
}: {
    orders: Paginated<TrashedOrder>;
}) {
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(
        null,
    );

    function confirmAction() {
        if (!pendingAction) {
            return;
        }

        if (pendingAction.type === 'restore') {
            router.post(
                orders.restore(pendingAction.order.id).url,
                {},
                {
                    preserveScroll: true,
                    onFinish: () => setPendingAction(null),
                },
            );
        } else if (pendingAction.type === 'delete') {
            router.delete(orders.forceDelete(pendingAction.order.id).url, {
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            });
        } else {
            router.delete(orders.clearTrash().url, {
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            });
        }
    }

    return (
        <>
            <Head title="Trashed Orders" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Trashed Orders"
                    description="Orders moved to trash. Restore them or delete them permanently."
                />
                {paginated.data.length > 0 && (
                    <Button
                        variant="destructive"
                        onClick={() => setPendingAction({ type: 'clear' })}
                    >
                        Clear trash
                    </Button>
                )}
            </div>

            {paginated.data.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No trashed orders.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {paginated.data.map((order) => (
                    <div key={order.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-2">
                            <span className="font-medium">
                                {order.order_number}
                            </span>
                            <Badge variant="outline">
                                {order.status_label}
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm">
                            {order.customer_name} · {order.customer_phone}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                {order.deleted_at
                                    ? new Date(
                                          order.deleted_at,
                                      ).toLocaleString()
                                    : '—'}
                            </span>
                            <span className="font-medium text-foreground">
                                ৳{order.grand_total}
                            </span>
                        </div>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPendingAction({ type: 'restore', order })
                                }
                            >
                                Restore
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    setPendingAction({ type: 'delete', order })
                                }
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
                            <TableHead className="max-w-[100px]">
                                Customer
                            </TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Deleted</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginated.data.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    {order.order_number}
                                </TableCell>
                                <TableCell
                                    className="max-w-[100px] truncate"
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
                                    {order.deleted_at
                                        ? new Date(
                                              order.deleted_at,
                                          ).toLocaleString()
                                        : '—'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPendingAction({
                                                    type: 'restore',
                                                    order,
                                                })
                                            }
                                        >
                                            Restore
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setPendingAction({
                                                    type: 'delete',
                                                    order,
                                                })
                                            }
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination links={paginated.links} />

            <ConfirmDialog
                open={pendingAction !== null}
                onOpenChange={(open) => !open && setPendingAction(null)}
                title={
                    pendingAction?.type === 'restore'
                        ? 'Restore order?'
                        : pendingAction?.type === 'delete'
                          ? 'Permanently delete order?'
                          : 'Clear all trashed orders?'
                }
                description={
                    pendingAction?.type === 'restore'
                        ? `Order "${pendingAction.order.order_number}" will be restored and moved back to the main Orders list.`
                        : pendingAction?.type === 'delete'
                          ? `Order "${pendingAction.order.order_number}" will be permanently deleted. This cannot be undone.`
                          : pendingAction?.type === 'clear'
                            ? `All ${paginated.total} trashed order${paginated.total === 1 ? '' : 's'} will be permanently deleted. This cannot be undone.`
                            : undefined
                }
                confirmLabel={
                    pendingAction?.type === 'restore'
                        ? 'Restore'
                        : pendingAction?.type === 'delete'
                          ? 'Delete permanently'
                          : 'Clear trash'
                }
                destructive={pendingAction?.type !== 'restore'}
                onConfirm={confirmAction}
            />
        </>
    );
}

TrashedOrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Trashed Orders', href: orders.trashed() },
    ],
};
