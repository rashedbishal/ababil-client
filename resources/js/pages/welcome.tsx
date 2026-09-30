import { Head, useForm, useHttp } from '@inertiajs/react';
import { useMemo, useRef } from 'react';
import CheckoutSection from '@/components/landing/checkout-section';
import FaqSection from '@/components/landing/faq-section';
import FloatingActions from '@/components/landing/floating-actions';
import GuaranteeSection from '@/components/landing/guarantee-section';
import HeroSection from '@/components/landing/hero-section';
import IngredientsSection from '@/components/landing/ingredients-section';
import ProblemSection from '@/components/landing/problem-section';
import SafetySection from '@/components/landing/safety-section';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader from '@/components/landing/site-header';
import TestimonialsSection from '@/components/landing/testimonials-section';
import TrustSection from '@/components/landing/trust-section';
import UsageGuideSection from '@/components/landing/usage-guide-section';
import UspSection from '@/components/landing/usp-section';
import { useCheckoutSession } from '@/hooks/use-checkout-session';
import incompleteOrders from '@/routes/incomplete-orders';
import orders from '@/routes/orders';

type Product = {
    id: number;
    name: string;
    short_description: string | null;
    description: string | null;
    regular_price: string;
    sale_price: string | null;
    sku: string;
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
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    contact: Contact;
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
    const shippingCharge = selectedShippingArea
        ? Number(selectedShippingArea.charge)
        : 0;
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

        form.post(orders.store().url);
    }

    if (!product) {
        return (
            <>
                <Head title="Store" />
                <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-center">
                    <p className="font-bengali text-neutral-400">
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

            <div className="dark min-h-screen bg-neutral-950 font-sans text-neutral-100">
                <SiteHeader phone={contact.phone} />

                <main>
                    <HeroSection
                        regularPrice={product.regular_price}
                        salePrice={product.sale_price}
                    />
                    <ProblemSection />
                    <UspSection />
                    <IngredientsSection />
                    <UsageGuideSection />
                    <SafetySection />
                    <TrustSection />
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
                        shippingAreas={shippingAreas}
                        shippingAreaId={form.data.shipping_area_id}
                        onShippingAreaChange={(value) =>
                            updateAndTrack({ shipping_area_id: value })
                        }
                        customerNote={form.data.customer_note}
                        onCustomerNoteChange={(value) =>
                            form.setData('customer_note', value)
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
            </div>
        </>
    );
}
