export type PurchaseOrderItem = {
    sku: string | null;
    product_name: string;
    size_name: string | null;
    unit_price: string;
    quantity: number;
};

export type PurchaseOrder = {
    order_number: string;
    grand_total: string;
    shipping_charge: string;
    discount: string;
    items: PurchaseOrderItem[];
};

// GA4/GTM's standard ecommerce "purchase" event shape - see
// https://developers.google.com/tag-platform/tag-manager/web/datalayer#ecommerce
// Configure tags/triggers for this event inside the GTM container itself
// (tagmanager.google.com); this only needs to ship the data once.
export function pushPurchaseEvent(order: PurchaseOrder) {
    // Guard against double counting if this fires more than once for the
    // same order (e.g. a page reload).
    const dedupeKey = `purchase_tracked_${order.order_number}`;
    if (sessionStorage.getItem(dedupeKey)) {
        return;
    }

    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
        event: 'purchase',
        // Lets GTM pass the same id to both a browser-side Pixel/GA4 tag and
        // a future server-side Conversions API call, so the platform can
        // dedupe the two into a single event instead of double-counting.
        event_id: order.order_number,
        ecommerce: {
            transaction_id: order.order_number,
            value: Number(order.grand_total),
            shipping: Number(order.shipping_charge),
            discount: Number(order.discount),
            currency: 'BDT',
            items: order.items.map((item) => ({
                item_id: item.sku ?? undefined,
                item_name: item.product_name,
                item_variant: item.size_name ?? undefined,
                price: Number(item.unit_price),
                quantity: item.quantity,
            })),
        },
    });

    sessionStorage.setItem(dedupeKey, '1');
}
