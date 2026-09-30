import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export default function OrderShow({
    order,
    statuses,
}: {
    order: OrderDetail;
    statuses: { value: string; label: string }[];
}) {
    const form = useForm({
        status: order.status,
        admin_note: order.admin_note ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(orders.update(order.id).url, { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex items-center justify-between">
                <Heading
                    title={`Order ${order.order_number}`}
                    description={`Placed ${order.created_at ? new Date(order.created_at).toLocaleString() : ''}`}
                />
                <Badge variant="outline" className="text-sm">
                    {statuses.find((s) => s.value === order.status)?.label ??
                        order.status}
                </Badge>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
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
                                            <TableCell>
                                                {item.product_name}
                                            </TableCell>
                                            <TableCell>
                                                {item.size_name ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                {item.sku ?? '—'}
                                            </TableCell>
                                            <TableCell>
                                                ৳{item.unit_price}
                                            </TableCell>
                                            <TableCell>
                                                {item.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ৳{item.line_total}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Subtotal
                                    </span>
                                    <span>৳{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Shipping ({order.shipping_area_name})
                                    </span>
                                    <span>৳{order.shipping_charge}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Discount
                                    </span>
                                    <span>-৳{order.discount}</span>
                                </div>
                                <div className="flex justify-between border-t pt-1 font-semibold">
                                    <span>Grand total</span>
                                    <span>৳{order.grand_total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    Name:
                                </span>{' '}
                                {order.customer_name}
                            </p>
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
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Diagnostics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    IP address:
                                </span>{' '}
                                {order.customer_ip ?? '—'}
                            </p>
                            <p className="break-all">
                                <span className="text-muted-foreground">
                                    User agent:
                                </span>{' '}
                                {order.user_agent ?? '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status history</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3 text-sm">
                                {order.history.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="border-l-2 pl-3"
                                    >
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
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Update order</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        value={form.data.status}
                                        onChange={(e) =>
                                            form.setData(
                                                'status',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                                    >
                                        {statuses.map((status) => (
                                            <option
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={form.errors.status} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="admin_note">
                                        Admin note
                                    </Label>
                                    <Textarea
                                        id="admin_note"
                                        rows={4}
                                        value={form.data.admin_note}
                                        onChange={(e) =>
                                            form.setData(
                                                'admin_note',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.admin_note}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                >
                                    Save
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Courier</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>
                                <span className="text-muted-foreground">
                                    Provider:
                                </span>{' '}
                                {order.courier_provider ?? '—'}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    Status:
                                </span>{' '}
                                {order.courier_status ?? '—'}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    Consignment:
                                </span>{' '}
                                {order.courier_consignment_id ?? '—'}
                            </p>
                            <p>
                                <span className="text-muted-foreground">
                                    Tracking:
                                </span>{' '}
                                {order.courier_tracking_code ?? '—'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Courier submission will be available once a
                                provider is configured under Courier
                                Integration.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
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
