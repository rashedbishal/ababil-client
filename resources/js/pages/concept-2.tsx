import { useEffect, useState } from 'react';
import CheckoutDialog from '@/components/landing/checkout-dialog';
import FaqSectionV2 from '@/components/landing/faq-section-v2';
import FloatingActions from '@/components/landing/floating-actions';
import type { GalleryItem } from '@/components/landing/gallery-section';
import GallerySection from '@/components/landing/gallery-section';
import GuaranteeSectionV2 from '@/components/landing/guarantee-section-v2';
import HeroSection from '@/components/landing/hero-section';
import LabTestedSectionV2 from '@/components/landing/lab-tested-section-v2';
import MarqueeStripV2 from '@/components/landing/marquee-strip-v2';
import NationwideSection from '@/components/landing/nationwide-section';
import OrderCtaBandV2 from '@/components/landing/order-cta-band-v2';
import OrderResultDialog from '@/components/landing/order-result-dialog';
import { problems } from '@/components/landing/problem-section';
import PaymentSection from '@/components/landing/payment-section';
import SafetySectionV2 from '@/components/landing/safety-section-v2';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader from '@/components/landing/site-header';
import TestimonialsSection from '@/components/landing/testimonials-section';
import TrustSectionV2 from '@/components/landing/trust-section-v2';
import { usps } from '@/components/landing/usp-section';
import { steps } from '@/components/landing/usage-guide-section';
import { useCheckoutForm } from '@/hooks/use-checkout-form';
import type {
    Contact,
    Product,
    ShippingArea,
    VideoReview,
} from '@/types/storefront';

const reliefGallery: GalleryItem[] = problems.map((p) => ({
    id: p.label,
    image: p.image,
    alt: p.label,
    title: p.label,
}));

const uspGallery: GalleryItem[] = usps.map((u) => ({
    id: u.title,
    image: u.image,
    alt: u.title,
    title: u.title,
    description: u.description,
}));

const usageGallery: GalleryItem[] = steps.map((s) => ({
    id: s.title,
    image: s.image,
    alt: s.title,
    title: s.title,
    description: s.description,
    features: [s.tip],
}));

export default function Concept2({
    product,
    shippingAreas,
    contact,
    formToken,
    reviews,
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    contact: Contact;
    formToken: string;
    reviews: VideoReview[];
}) {
    const checkout = useCheckoutForm({ product, shippingAreas, formToken });
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        if (checkout.orderResult) {
            setDialogOpen(false);
        }
    }, [checkout.orderResult]);

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-amber-50 p-6 text-center">
                <p className="font-bengali text-stone-500">
                    এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-stone-900">
            <SiteHeader phone={contact.phone} />

            <main>
                <HeroSection />
                <NationwideSection />
                <MarqueeStripV2 />

                <GallerySection
                    id="relief"
                    eyebrow="যেখানে ব্যথা হয়"
                    heading="শরীরের যেসব স্থানে ব্যথা কমাতে সাহায্য করে"
                    items={reliefGallery}
                    layout="minimal"
                />

                <OrderCtaBandV2
                    title="ব্যথা যেখানেই হোক, আজই অর্ডার করুন"
                    subtitle="ক্যাশ অন ডেলিভারি — সারা বাংলাদেশে"
                />

                <GallerySection
                    id="usp"
                    eyebrow="কেন আবাবিল"
                    heading="আবাবিলের বিশেষত্ব"
                    items={uspGallery}
                    layout="image-with-copy"
                />

                <TrustSectionV2 />
                <LabTestedSectionV2 />

                <OrderCtaBandV2
                    title="হোম ডেলিভারিতে আজই পেয়ে যান আবাবিল"
                    subtitle="সারা দেশে ঘরে বসেই পৌঁছে যাবে — ক্যাশ অন ডেলিভারি"
                />

                <GallerySection
                    id="usage"
                    eyebrow="ব্যবহার পদ্ধতি"
                    heading="যেভাবে ব্যবহার করবেন"
                    items={usageGallery}
                    layout="image-with-copy"
                />

                <SafetySectionV2 />

                <OrderCtaBandV2
                    title="নিরাপদে ব্যবহার করুন, আজই অর্ডার করুন"
                    subtitle="নির্দেশনা মেনে ব্যবহারে আবাবিল আপনার পাশে আছে"
                />

                <GuaranteeSectionV2 />

                <TestimonialsSection reviews={reviews} />

                <PaymentSection onOrderNowClick={() => setDialogOpen(true)} />

                <FaqSectionV2 />
            </main>

            <SiteFooter phone={contact.phone} />

            <FloatingActions
                whatsapp={contact.whatsapp}
                facebookUrl={contact.facebookUrl}
            />

            <CheckoutDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                productName={product.name}
                checkout={checkout}
            />

            <OrderResultDialog
                result={checkout.orderResult}
                onClose={checkout.clearOrderResult}
            />
        </div>
    );
}
