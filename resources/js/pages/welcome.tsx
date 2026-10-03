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
import IngredientsSection from '@/components/landing/ingredients-section';
import MarqueeStrip from '@/components/landing/marquee-strip';
import NationwideSection from '@/components/landing/nationwide-section';
import OrderCtaBand from '@/components/landing/order-cta-band';
import ProblemSection from '@/components/landing/problem-section';
import SafetySection from '@/components/landing/safety-section';
import ScrollProgress from '@/components/landing/scroll-progress';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader from '@/components/landing/site-header';
import StickyOrderBar from '@/components/landing/sticky-order-bar';
import TestimonialsSection from '@/components/landing/testimonials-section';
import TrustSection from '@/components/landing/trust-section';
import UsageGuideSection from '@/components/landing/usage-guide-section';
import UspSection from '@/components/landing/usp-section';
import { useCheckoutSession } from '@/hooks/use-checkout-session';
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
    featured_image_url: string | null;
    gallery_urls: string[];
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
    const form = useForm({
        product_id: product?.id ?? 0,
        variant_id: null as number | null,
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: shippingAreas[0]?.id ?? null,
        customer_note: '',
        session_token: '',
        form_token: formToken,
        // Honeypot: real visitors never see or fill this field.
        website: '',
    });

    const sessionToken = useCheckoutSession();
    const tracker = useHttp({
        session_token: sessionToken,
        product_id: product?.id ?? null,
        variant_id: null as number | null,
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: shippingAreas[0]?.id ?? null,
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
                shippingAreaName: placed.shipping_area_name,
                grandTotal: placed.grand_total,
            });

            form.reset(
                'quantity',
                'customer_name',
                'customer_phone',
                'delivery_address',
                'customer_note',
            );
        });
    }, []);

    function track(partial: Partial<typeof tracker.data>) {
        tracker.setData((data) => ({ ...data, ...partial }));

        if (trackTimeout.current) {
            clearTimeout(trackTimeout.current);
        }

        trackTimeout.current = setTimeout(() => {
            void tracker.post(incompleteOrders.store().url);
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
            <Head title={product.name}>
                {product.short_description && (
                    <meta
                        name="description"
                        content={product.short_description}
                    />
                )}
            </Head>

            <div className="min-h-screen bg-amber-50 font-sans text-stone-900">
                <ScrollProgress />
                <SiteHeader phone={contact.phone} />

                <main>
                    <HeroSection
                        regularPrice={product.regular_price}
                        salePrice={product.sale_price}
                    />
                    <MarqueeStrip />
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
                    <IngredientsSection />
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
                    <TrustSection />
                    <TestimonialsSection />
                    <OrderCtaBand
                        title="৩ দিনের মানি-ব্যাক গ্যারান্টি সহ অর্ডার করুন"
                        subtitle="ঝুঁকিমুক্তভাবে আজই ব্যবহার শুরু করুন"
                    />
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
