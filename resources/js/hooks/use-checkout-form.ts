import { router, useForm, useHttp } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OrderResult } from '@/components/landing/order-result-dialog';
import { useCheckoutSession } from '@/hooks/use-checkout-session';
import { shippingAreaLabel } from '@/lib/shipping-area';
import incompleteOrders from '@/routes/incomplete-orders';
import orders from '@/routes/orders';
import siteVisits from '@/routes/site-visits';
import type { Product, ShippingArea } from '@/types/storefront';

// Checkout form fields that the dialog's own <InputError> already renders -
// any validation error on a field outside this set would otherwise have no
// visible effect on the page at all.
const INLINE_ERROR_FIELDS = new Set([
    'customer_name',
    'customer_phone',
    'delivery_address',
    'shipping_area_id',
    'quantity',
    'customer_note',
]);

type TrackedField =
    | 'quantity'
    | 'customer_name'
    | 'customer_phone'
    | 'delivery_address'
    | 'shipping_area_id';

/**
 * Shared checkout state/logic for `pages/concept-3.tsx` (the live
 * storefront). This is a deliberate copy of the same logic that lives
 * inline in `pages/welcome.tsx` - the previous (now unrouted) storefront
 * design - not an extraction `welcome.tsx` itself imports, so that page
 * keeps its own independent copy and is unaffected by anything built on
 * top of this hook.
 */
export function useCheckoutForm({
    product,
    shippingAreas,
    formToken,
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    formToken: string;
}) {
    // Most orders ship within Dhaka, so it's pre-selected rather than making
    // every shopper pick it manually. Matched by name rather than assuming
    // array order, since admins can reorder shipping areas.
    const defaultShippingAreaId =
        shippingAreas.find((a) => a.name === 'Inside Dhaka City Corporation')
            ?.id ??
        shippingAreas[0]?.id ??
        null;

    const form = useForm({
        product_id: product?.id ?? 0,
        variant_id: null as number | null,
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: defaultShippingAreaId,
        customer_note: '',
        session_token: '',
        form_token: formToken,
        // Honeypot: real visitors never see or fill this field.
        website: '',
    });

    const [sessionToken, rotateCheckoutSession] = useCheckoutSession();
    const tracker = useHttp({
        session_token: sessionToken,
        product_id: product?.id ?? null,
        variant_id: null as number | null,
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: defaultShippingAreaId,
    });
    const trackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const visitTracker = useHttp({ session_token: sessionToken });

    useEffect(() => {
        void visitTracker.post(siteVisits.store().url);
    }, []);

    const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (
                event as CustomEvent<{
                    flash?: {
                        orderPlaced?: {
                            order_number: string;
                            customer_name: string;
                            shipping_area_name: string;
                            grand_total: string;
                        };
                    };
                }>
            ).detail?.flash;
            const placed = flash?.orderPlaced;

            if (!placed) {
                return;
            }

            setOrderResult({
                type: 'success',
                orderNumber: placed.order_number,
                customerName: placed.customer_name,
                shippingAreaName: shippingAreaLabel(placed.shipping_area_name),
                grandTotal: placed.grand_total,
            });

            form.reset(
                'quantity',
                'customer_name',
                'customer_phone',
                'delivery_address',
                'customer_note',
            );

            if (trackTimeout.current) {
                clearTimeout(trackTimeout.current);
                trackTimeout.current = null;
            }

            const freshSessionToken = rotateCheckoutSession();
            tracker.setData((data) => ({
                ...data,
                session_token: freshSessionToken,
                customer_name: '',
                customer_phone: '',
                delivery_address: '',
            }));
        });
    }, []);

    function track(partial: Partial<typeof tracker.data>) {
        tracker.setData((data) => ({ ...data, ...partial }));

        if (trackTimeout.current) {
            clearTimeout(trackTimeout.current);
            trackTimeout.current = null;
        }

        const phone = partial.customer_phone ?? '';

        if (!/^01[3-9]\d{8}$/.test(phone)) {
            return;
        }

        trackTimeout.current = setTimeout(() => {
            void tracker.post(incompleteOrders.store().url, {
                onSuccess: (response) => {
                    const usedSessionToken = (
                        response as { session_token?: string } | null
                    )?.session_token;

                    if (usedSessionToken && usedSessionToken !== sessionToken) {
                        rotateCheckoutSession(usedSessionToken);
                        tracker.setData('session_token', usedSessionToken);
                    }
                },
            });
        }, 2000);
    }

    const unitPrice = useMemo(() => {
        if (!product) {
            return 0;
        }

        return Number(product.sale_price ?? product.regular_price);
    }, [product]);

    const selectedShippingArea = shippingAreas.find(
        (a) => a.id === form.data.shipping_area_id,
    );
    const shippingCharge = product?.free_delivery
        ? 0
        : selectedShippingArea
          ? Number(selectedShippingArea.charge)
          : 0;
    const displayShippingAreas = product?.free_delivery
        ? shippingAreas.map((area) => ({ ...area, charge: '0.00' }))
        : shippingAreas;
    const subtotal = unitPrice * form.data.quantity;
    const grandTotal = subtotal + shippingCharge;

    function setField<K extends TrackedField>(
        key: K,
        value: (typeof form.data)[K],
    ) {
        const next = { ...form.data, [key]: value };
        form.setData(next);
        track({
            product_id: next.product_id,
            variant_id: next.variant_id,
            quantity: next.quantity,
            customer_name: next.customer_name,
            customer_phone: next.customer_phone,
            delivery_address: next.delivery_address,
            shipping_area_id: next.shipping_area_id,
        });
    }

    function setNote(value: string) {
        form.setData('customer_note', value);
    }

    function setHoneypot(value: string) {
        form.setData('website', value);
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            session_token: sessionToken,
        }));

        form.post(orders.store().url, {
            preserveScroll: true,
            onError: (errors) => {
                if (errors.order) {
                    setOrderResult({ type: 'error', message: errors.order });

                    return;
                }

                const isShownInline = (field: string) =>
                    INLINE_ERROR_FIELDS.has(field);

                if (
                    Object.keys(errors).length > 0 &&
                    !Object.keys(errors).every(isShownInline)
                ) {
                    setOrderResult({
                        type: 'error',
                        message:
                            "We couldn't process your order. Please refresh the page and try again.",
                    });
                }
            },
        });
    }

    return {
        data: form.data,
        setField,
        setNote,
        setHoneypot,
        displayShippingAreas,
        subtotal,
        shippingCharge,
        grandTotal,
        errors: form.errors as Partial<Record<string, string>>,
        processing: form.processing,
        submit,
        orderResult,
        clearOrderResult: () => setOrderResult(null),
    };
}

export type CheckoutForm = ReturnType<typeof useCheckoutForm>;
