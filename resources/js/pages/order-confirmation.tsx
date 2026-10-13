import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type OrderItem = {
    sku: string;
    product_name: string;
    size_name: string | null;
    quantity: number;
    unit_price: string;
    line_total: string;
};

type Order = {
    order_number: string;
    customer_name: string;
    shipping_area_name: string;
    subtotal: string;
    shipping_charge: string;
    discount: string;
    grand_total: string;
    status: string;
    items: OrderItem[];
};

// GA4/GTM's standard ecommerce "purchase" event shape - see
// https://developers.google.com/tag-platform/tag-manager/web/datalayer#ecommerce
// Configure tags/triggers for this event inside the GTM container itself
// (tagmanager.google.com); this only needs to ship the data once.
function pushPurchaseEvent(order: Order) {
    // Guard against double counting if the confirmation page is reloaded.
    const dedupeKey = `purchase_tracked_${order.order_number}`;
    if (sessionStorage.getItem(dedupeKey)) {
        return;
    }

    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
            transaction_id: order.order_number,
            value: Number(order.grand_total),
            shipping: Number(order.shipping_charge),
            discount: Number(order.discount),
            currency: 'BDT',
            items: order.items.map((item) => ({
                item_id: item.sku,
                item_name: item.product_name,
                item_variant: item.size_name ?? undefined,
                price: Number(item.unit_price),
                quantity: item.quantity,
            })),
        },
    });

    sessionStorage.setItem(dedupeKey, '1');
}

export default function OrderConfirmation({ order }: { order: Order }) {
    const { name: siteName } = usePage<{ name: string }>().props;

    useEffect(() => {
        pushPurchaseEvent(order);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order.order_number]);

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b px-6 py-4">
                    <span className="text-lg font-semibold">{siteName}</span>
                </header>

                <main className="mx-auto max-w-xl space-y-6 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Thank you, {order.customer_name}!
                        </h1>
                        <p className="text-muted-foreground">
                            Your order{' '}
                            <span className="font-medium">
                                {order.order_number}
                            </span>{' '}
                            has been placed and is now{' '}
                            <span className="font-medium">{order.status}</span>.
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <h2 className="mb-2 font-medium">Order summary</h2>
                        <ul className="space-y-1 text-sm">
                            {order.items.map((item, index) => (
                                <li
                                    key={index}
                                    className="flex justify-between"
                                >
                                    <span>
                                        {item.product_name}
                                        {item.size_name
                                            ? ` (${item.size_name})`
                                            : ''}{' '}
                                        × {item.quantity}
                                    </span>
                                    <span>৳{item.line_total}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 space-y-1 border-t pt-2 text-sm">
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
                            <div className="flex justify-between font-semibold">
                                <span>Grand total</span>
                                <span>৳{order.grand_total}</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
