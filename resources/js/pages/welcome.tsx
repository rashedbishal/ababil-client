import { Head, router, useForm, useHttp } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import CheckoutSection from '@/components/landing/checkout-section';
import OrderResultDialog, {
    type OrderResult,
} from '@/components/landing/order-result-dialog';
import FaqSection from '@/components/landing/faq-section';
import FloatingActions from '@/components/landing/floating-actions';
import GuaranteeSection from '@/components/landing/guarantee-section';
import HeroSection from '@/components/landing/hero-section';
import LabTestedSection from '@/components/landing/lab-tested-section';
import MarqueeStrip from '@/components/landing/marquee-strip';
import NationwideSection from '@/components/landing/nationwide-section';
import OrderCtaBand from '@/components/landing/order-cta-band';
import ProblemSection from '@/components/landing/problem-section';
import ProductHighlightSection from '@/components/landing/product-highlight-section';
import SafetySection from '@/components/landing/safety-section';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader from '@/components/landing/site-header';
import StickyOrderBar from '@/components/landing/sticky-order-bar';
import TestimonialsSection from '@/components/landing/testimonials-section';
import TrustSection from '@/components/landing/trust-section';
import UsageGuideSection from '@/components/landing/usage-guide-section';
import UspSection from '@/components/landing/usp-section';
import { useCheckoutSession } from '@/hooks/use-checkout-session';
import { shippingAreaLabel } from '@/lib/shipping-area';
import incompleteOrders from '@/routes/incomplete-orders';
import orders from '@/routes/orders';
import siteVisits from '@/routes/site-visits';

type Product = {
    id: number;
    name: string;
    short_description: string | null;
    description: string | null;
    regular_price: string;
    sale_price: string | null;
    sku: string;
    free_delivery: boolean;
    in_stock: boolean;
    variants: {
        id: number;
        size: string | null;
        stock: number;
        in_stock: boolean;
        price: string;
    }[];
};

type ShippingArea = {
    id: number;
    name: string;
    charge: string;
};

type Contact = {
    phone: string | null;
    whatsapp: string | null;
    facebookUrl: string | null;
};

// Checkout form fields that already render their own inline <InputError> -
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

export default function Welcome({
    product,
    shippingAreas,
    contact,
    formToken,
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    contact: Contact;
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

            // A debounced tracking call from just before submit can still
            // be waiting to fire - left alone, it lands *after* this order
            // already exists, creating a fresh "incomplete" row for a
            // phone number that literally just finished checkout, which
            // nothing afterward will ever convert. Cancel it.
            if (trackTimeout.current) {
                clearTimeout(trackTimeout.current);
                trackTimeout.current = null;
            }

            // The form above resets so the shopper can place another order
            // without reloading - start a fresh checkout session too, or
            // tracking a next attempt would keep upserting the row that was
            // just marked Converted instead of a new one.
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

        // updateAndTrack() always forwards the full current value of every
        // tracked field (not just whichever one changed), so this reflects
        // what's actually in the phone field right now, regardless of
        // which field triggered this call.
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

                    // The backend rotates the token itself if the one we
                    // sent already belonged to a converted order (e.g. a
                    // stale value saved before this rotation logic
                    // existed) - adopt whatever it actually used so the
                    // next tracking call (and a placed order's own
                    // session_token) stays in sync with it.
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

    function updateAndTrack(partial: Partial<typeof form.data>) {
        const next = { ...form.data, ...partial };
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

                // Any validation error outside the fields the checkout form
                // already shows inline (name/phone/address/area/quantity/
                // note) would otherwise fail completely silently - the
                // click would appear to do nothing. Surface those too,
                // generically, rather than leave the shopper with no
                // feedback at all.
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

    if (!product) {
        return (
            <>
                <Head title="Store" />
                <div className="flex min-h-screen items-center justify-center bg-amber-50 p-6 text-center">
                    <p className="font-bengali text-stone-500">
                        এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            {/* No <Head> here: the title, description and other search/social
                tags are rendered server-side (App\Support\StorefrontSeo) so
                crawlers that don't run JavaScript still see them. */}
            <div className="min-h-screen bg-amber-50 font-sans text-stone-900">
                <SiteHeader phone={contact.phone} />

                <main>
                    <HeroSection />
                    <MarqueeStrip />
                    <ProductHighlightSection
                        regularPrice={product.regular_price}
                        salePrice={product.sale_price}
                    />
                    <ProblemSection />
                    <OrderCtaBand
                        title="ব্যথা যেখানেই হোক, আজই অর্ডার করুন"
                        subtitle="ক্যাশ অন ডেলিভারি — সারা বাংলাদেশে"
                    />
                    <UspSection />
                    <OrderCtaBand
                        title="এখনই অর্ডার করে পেয়ে যান আবাবিল"
                        subtitle="ক্যাশ অন ডেলিভারি — সারা বাংলাদেশে"
                    />
                    <TrustSection />
                    <LabTestedSection />
                    <NationwideSection />
                    <OrderCtaBand
                        title="হোম ডেলিভারিতে আজই পেয়ে যান আবাবিল"
                        subtitle="সারা দেশে ঘরে বসেই পৌঁছে যাবে — ক্যাশ অন ডেলিভারি"
                    />
                    <UsageGuideSection />
                    <SafetySection />
                    <OrderCtaBand
                        title="নিরাপদে ব্যবহার করুন, আজই অর্ডার করুন"
                        subtitle="নির্দেশনা মেনে ব্যবহারে আবাবিল আপনার পাশে আছে"
                    />
                    <TestimonialsSection />
                    <GuaranteeSection />

                    <CheckoutSection
                        productName={product.name}
                        quantity={form.data.quantity}
                        onQuantityChange={(value) =>
                            updateAndTrack({ quantity: value })
                        }
                        customerName={form.data.customer_name}
                        onCustomerNameChange={(value) =>
                            updateAndTrack({ customer_name: value })
                        }
                        customerPhone={form.data.customer_phone}
                        onCustomerPhoneChange={(value) =>
                            updateAndTrack({ customer_phone: value })
                        }
                        deliveryAddress={form.data.delivery_address}
                        onDeliveryAddressChange={(value) =>
                            updateAndTrack({ delivery_address: value })
                        }
                        shippingAreas={displayShippingAreas}
                        shippingAreaId={form.data.shipping_area_id}
                        onShippingAreaChange={(value) =>
                            updateAndTrack({ shipping_area_id: value })
                        }
                        customerNote={form.data.customer_note}
                        onCustomerNoteChange={(value) =>
                            form.setData('customer_note', value)
                        }
                        honeypotValue={form.data.website}
                        onHoneypotChange={(value) =>
                            form.setData('website', value)
                        }
                        subtotal={subtotal}
                        shippingCharge={shippingCharge}
                        grandTotal={grandTotal}
                        errors={form.errors}
                        processing={form.processing}
                        onSubmit={submit}
                    />

                    <FaqSection />
                </main>

                <SiteFooter phone={contact.phone} />

                <FloatingActions
                    whatsapp={contact.whatsapp}
                    facebookUrl={contact.facebookUrl}
                />

                <StickyOrderBar
                    price={product.sale_price ?? product.regular_price}
                />

                <OrderResultDialog
                    result={orderResult}
                    onClose={() => setOrderResult(null)}
                />
            </div>
        </>
    );
}
