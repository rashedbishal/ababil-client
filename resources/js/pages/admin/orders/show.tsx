import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { dashboard } from '@/routes/admin';
import orders from '@/routes/admin/orders';

type OrderItem = {
    id: number;
    product_name: string;
    sku: string | null;
    size_name: string | null;
    unit_price: string;
    quantity: number;
    line_total: string;
};

type HistoryEntry = {
    id: number;
    from_status: string | null;
    to_status: string;
    note: string | null;
    changed_by: string | null;
    created_at: string | null;
};

type OrderDetail = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    shipping_area_name: string;
    subtotal: string;
    shipping_charge: string;
    discount: string;
    grand_total: string;
    status: string;
    courier_status: string | null;
    courier_raw_status: string | null;
    status_sync_mode: 'automated' | 'manual';
    customer_ip: string | null;
    user_agent: string | null;
    customer_note: string | null;
    admin_note: string | null;
    courier_provider: string | null;
    courier_consignment_id: string | null;
    courier_tracking_code: string | null;
    created_at: string | null;
    updated_at: string | null;
    items: OrderItem[];
    history: HistoryEntry[];
};

type AutomatedSyncPreview = {
    courier_status_label: string | null;
    implied_status_label: string | null;
    implied_status_value: string | null;
    will_change_status: boolean;
};

export default function OrderShow({
    order,
    statuses,
    courierConfigured,
    automatedSyncPreview,
}: {
    order: OrderDetail;
    statuses: { value: string; label: string }[];
    courierConfigured: boolean;
    automatedSyncPreview: AutomatedSyncPreview;
}) {
    const form = useForm({
        status: order.status,
        admin_note: order.admin_note ?? '',
    });

    useEffect(() => {
        form.setData('status', order.status);
    }, [order.status]);

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(orders.update(order.id).url, { preserveScroll: true });
    }

    const [editingCustomer, setEditingCustomer] = useState(false);
    const customerForm = useForm({
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        customer_note: order.customer_note ?? '',
    });

    useEffect(() => {
        customerForm.setData({
            customer_phone: order.customer_phone,
            delivery_address: order.delivery_address,
            customer_note: order.customer_note ?? '',
        });
    }, [order.customer_phone, order.delivery_address, order.customer_note]);

    function submitCustomer(e: React.FormEvent) {
        e.preventDefault();
        customerForm.patch(orders.update(order.id).url, {
            preserveScroll: true,
            onSuccess: () => setEditingCustomer(false),
        });
    }

    function cancelEditCustomer() {
        customerForm.setData({
            customer_phone: order.customer_phone,
            delivery_address: order.delivery_address,
            customer_note: order.customer_note ?? '',
        });
        customerForm.clearErrors();
        setEditingCustomer(false);
    }

    function submitToCourier() {
        router.post(
            orders.courier.submit(order.id).url,
            {},
            { preserveScroll: true },
        );
    }

    function refreshCourierStatus() {
        router.post(
            orders.courier.refresh(order.id).url,
            {},
            { preserveScroll: true },
        );
    }

    function updateStatusSyncMode(mode: 'automated' | 'manual') {
        if (!mode || mode === order.status_sync_mode) {
            return;
        }

        if (mode === 'automated' && automatedSyncPreview.will_change_status) {
            const currentLabel =
                statuses.find((s) => s.value === order.status)?.label ??
                order.status;
            const stockNote =
                automatedSyncPreview.implied_status_value === 'cancelled'
                    ? ' This will also restore the stock reserved for this order.'
                    : '';

            const confirmed = confirm(
                `Switching to Automated will immediately change this order's status from "${currentLabel}" to "${automatedSyncPreview.implied_status_label}", based on the last known courier status (${automatedSyncPreview.courier_status_label}).${stockNote} Continue?`,
            );

            if (!confirmed) {
                return;
            }
        }

        router.patch(
            orders.statusSyncMode(order.id).url,
            { status_sync_mode: mode },
            { preserveScroll: true },
        );
    }

    const isAutomated = order.status_sync_mode === 'automated';
    const isMobile = useIsMobile();

    const orderTotals = (
        <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">
                    Shipping ({order.shipping_area_name})
                </span>
                <span>৳{order.shipping_charge}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-৳{order.discount}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-semibold">
                <span>Grand total</span>
                <span>৳{order.grand_total}</span>
            </div>
        </div>
    );

    const itemsCard = (
        <Card>
            <CardHeader>
                <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Unit price</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead className="text-right">
                                Line total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.items.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.product_name}</TableCell>
                                <TableCell>{item.size_name ?? '—'}</TableCell>
                                <TableCell>{item.sku ?? '—'}</TableCell>
                                <TableCell>৳{item.unit_price}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell className="text-right">
                                    ৳{item.line_total}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {orderTotals}
            </CardContent>
        </Card>
    );

    const itemsCardMobile = (
        <Card>
            <CardHeader>
                <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-lg border p-3 text-sm"
                        >
                            <p className="font-medium">
                                {item.product_name}
                                {item.size_name ? ` (${item.size_name})` : ''}
                            </p>
                            {item.sku && (
                                <p className="text-xs text-muted-foreground">
                                    SKU: {item.sku}
                                </p>
                            )}
                            <div className="mt-1 flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    {item.quantity} × ৳{item.unit_price}
                                </span>
                                <span className="font-medium">
                                    ৳{item.line_total}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {orderTotals}
            </CardContent>
        </Card>
    );

    const customerCard = (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Customer</CardTitle>
                {!editingCustomer && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCustomer(true)}
                    >
                        Edit
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {order.customer_name}
                </p>

                {editingCustomer ? (
                    <form onSubmit={submitCustomer} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="customer_phone">Phone</Label>
                            <Input
                                id="customer_phone"
                                value={customerForm.data.customer_phone}
                                onChange={(e) =>
                                    customerForm.setData(
                                        'customer_phone',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={customerForm.errors.customer_phone}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="delivery_address">Address</Label>
                            <Textarea
                                id="delivery_address"
                                rows={3}
                                value={customerForm.data.delivery_address}
                                onChange={(e) =>
                                    customerForm.setData(
                                        'delivery_address',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={customerForm.errors.delivery_address}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customer_note">Note</Label>
                            <Textarea
                                id="customer_note"
                                rows={3}
                                value={customerForm.data.customer_note}
                                onChange={(e) =>
                                    customerForm.setData(
                                        'customer_note',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={customerForm.errors.customer_note}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                size="sm"
                                disabled={customerForm.processing}
                            >
                                Save
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={cancelEditCustomer}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p>
                            <span className="text-muted-foreground">
                                Phone:
                            </span>{' '}
                            {order.customer_phone}
                        </p>
                        <p>
                            <span className="text-muted-foreground">
                                Address:
                            </span>{' '}
                            {order.delivery_address}
                        </p>
                        {order.customer_note && (
                            <p>
                                <span className="text-muted-foreground">
                                    Note:
                                </span>{' '}
                                {order.customer_note}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );

    const diagnosticsCard = (
        <Card>
            <CardHeader>
                <CardTitle>Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p>
                    <span className="text-muted-foreground">IP address:</span>{' '}
                    {order.customer_ip ?? '—'}
                </p>
                <p className="break-all">
                    <span className="text-muted-foreground">User agent:</span>{' '}
                    {order.user_agent ?? '—'}
                </p>
            </CardContent>
        </Card>
    );

    const historyCard = (
        <Card>
            <CardHeader>
                <CardTitle>Status history</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3 text-sm">
                    {order.history.map((entry) => (
                        <li key={entry.id} className="border-l-2 pl-3">
                            <p className="font-medium">
                                {entry.from_status
                                    ? `${entry.from_status} → `
                                    : ''}
                                {entry.to_status}
                            </p>
                            {entry.note && (
                                <p className="text-muted-foreground">
                                    {entry.note}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {entry.created_at
                                    ? new Date(
                                          entry.created_at,
                                      ).toLocaleString()
                                    : ''}
                                {entry.changed_by
                                    ? ` · ${entry.changed_by}`
                                    : ' · customer'}
                            </p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );

    const updateOrderCard = (
        <Card>
            <CardHeader>
                <CardTitle>Update order</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 space-y-2">
                    <Label>Status sync</Label>
                    <ToggleGroup
                        type="single"
                        variant="outline"
                        value={order.status_sync_mode}
                        onValueChange={updateStatusSyncMode}
                        className="w-full"
                    >
                        <ToggleGroupItem value="automated" className="flex-1">
                            Automated
                        </ToggleGroupItem>
                        <ToggleGroupItem value="manual" className="flex-1">
                            Manual
                        </ToggleGroupItem>
                    </ToggleGroup>
                    <p className="text-xs text-muted-foreground">
                        {isAutomated
                            ? 'Status is synced automatically from the courier. Switch to manual to edit it by hand.'
                            : 'Status is fully manual. Switch to automated to sync it from the courier again.'}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={form.data.status}
                            disabled={isAutomated}
                            onValueChange={(value) =>
                                form.setData('status', value)
                            }
                        >
                            <SelectTrigger id="status" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((status) => (
                                    <SelectItem
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="admin_note">Admin note</Label>
                        <Textarea
                            id="admin_note"
                            rows={4}
                            value={form.data.admin_note}
                            onChange={(e) =>
                                form.setData('admin_note', e.target.value)
                            }
                        />
                        <InputError message={form.errors.admin_note} />
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </form>
            </CardContent>
        </Card>
    );

    const courierCard = order.status !== 'cancelled' && (
        <Card>
            <CardHeader>
                <CardTitle>Courier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p>
                    <span className="text-muted-foreground">Provider:</span>{' '}
                    {order.courier_provider ?? '—'}
                </p>
                <p>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {order.courier_status ?? '—'}
                    {order.courier_raw_status && (
                        <span className="text-muted-foreground">
                            {' '}
                            ({order.courier_raw_status})
                        </span>
                    )}
                </p>
                <p>
                    <span className="text-muted-foreground">Consignment:</span>{' '}
                    {order.courier_consignment_id ?? '—'}
                </p>
                <p>
                    <span className="text-muted-foreground">Tracking:</span>{' '}
                    {order.courier_tracking_code ?? '—'}
                </p>

                {!courierConfigured && (
                    <p className="text-xs text-muted-foreground">
                        No courier provider is configured yet. Set one up under
                        Courier Integration.
                    </p>
                )}

                {courierConfigured && order.courier_consignment_id === null && (
                    <Button type="button" size="sm" onClick={submitToCourier}>
                        Submit to courier
                    </Button>
                )}

                {courierConfigured && order.courier_consignment_id !== null && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={refreshCourierStatus}
                    >
                        Refresh status
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title={`Order ${order.order_number}`}
                    description={`Placed ${order.created_at ? new Date(order.created_at).toLocaleString() : ''}`}
                />
                <Badge variant="outline" className="w-fit text-sm">
                    {statuses.find((s) => s.value === order.status)?.label ??
                        order.status}
                </Badge>
            </div>

            {isMobile ? (
                <div className="space-y-6">
                    {itemsCardMobile}
                    {customerCard}
                    {courierCard}
                    {updateOrderCard}
                    {diagnosticsCard}
                    {historyCard}
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {itemsCard}
                        {customerCard}
                        {diagnosticsCard}
                        {historyCard}
                    </div>

                    <div className="space-y-6">
                        {updateOrderCard}
                        {courierCard}
                    </div>
                </div>
            )}
        </>
    );
}

OrderShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Orders', href: orders.index() },
        { title: 'Order', href: '#' },
    ],
};
