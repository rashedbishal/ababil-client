import { LazyMotion } from 'motion/react';
import { lazy, Suspense, useEffect } from 'react';
import Concept3Banner from '@/components/landing/concept3-banner';
import Concept3CertificationSection, {
    type Concept3Partner,
} from '@/components/landing/concept3-certification-section';
import type { Concept3PhotoItem } from '@/components/landing/concept3-photo-gallery';
import Concept3ProductSection from '@/components/landing/concept3-product-section';
import Concept3StickyBar from '@/components/landing/concept3-sticky-bar';
import FloatingActions from '@/components/landing/floating-actions';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader, {
    type MobileNavLink,
    type NavLink,
} from '@/components/landing/site-header';
import {
    type OrderPlacedData,
    useCheckoutForm,
} from '@/hooks/use-checkout-form';
import type {
    Contact,
    Product,
    ShippingArea,
    VideoReview,
} from '@/types/storefront';

// Everything below the first couple of viewports (and the result dialog,
// which only renders after an order attempt) is code-split out of the main
// page chunk - Lighthouse flagged this page's initial JS as a Total
// Blocking Time contributor. The product/checkout section is imported
// eagerly so tapping any "অর্ডার করুন" can scroll straight to it; a lazy
// chunk that hadn't loaded yet left Facebook's in-app browser with a blank
// tap and a page reset.
const Concept3MapSection = lazy(
    () => import('@/components/landing/concept3-map-section'),
);
const Concept3PhotoGallery = lazy(
    () => import('@/components/landing/concept3-photo-gallery'),
);
const Concept3RoutineSection = lazy(
    () => import('@/components/landing/concept3-routine-section'),
);
const TestimonialsSection = lazy(
    () => import('@/components/landing/testimonials-section'),
);
const Concept3FaqSection = lazy(
    () => import('@/components/landing/concept3-faq-section'),
);
const Concept3ContactSection = lazy(
    () => import('@/components/landing/concept3-contact-section'),
);
const OrderResultDialog = lazy(
    () => import('@/components/landing/order-result-dialog'),
);

// Also code-splits `motion`'s animation engine itself out of the main page
// chunk - see components/landing/motion/features.ts.
const loadMotionFeatures = () =>
    import('@/components/landing/motion/features').then((mod) => mod.default);

// Concept 3's sections have their own ids (set on Concept3MapSection,
// Concept3PhotoGallery, Concept3RoutineSection and Concept3ProductSection
// below) rather than the main design's #problem/#usp/#lab-tested/#checkout,
// so the shared SiteHeader needs its own nav list for this page, ordered to
// match how the sections actually appear on the page: banner, certifications,
// order form (#product), delivery map, review videos, the photo galleries,
// FAQ.
const navLinks: NavLink[] = [
    { href: '#product', label: 'পেমেন্ট' },
    { href: '#delivery', label: 'ডেলিভারি' },
    { href: '#reviews', label: 'রিভিউ' },
    { href: '#features', label: 'কেন আবাবিল' },
    { href: '#routine', label: 'ব্যথার জায়গা' },
    { href: '#campaign', label: 'আপনজন' },
];

// A gallery section with no shown photos isn't rendered, so its nav link is
// dropped too rather than scrolling nowhere.
const gallerySectionByHref: Record<
    string,
    'features' | 'routine' | 'campaign'
> = {
    '#features': 'features',
    '#routine': 'routine',
    '#campaign': 'campaign',
};

const mobileNavLinks: MobileNavLink[] = [
    { href: '#top', label: 'হোম', icon: '🏠' },
    { href: '#product', label: 'পেমেন্ট', icon: '💳' },
    { href: '#delivery', label: 'ডেলিভারি', icon: '🚚' },
    { href: '#reviews', label: 'রিভিউ', icon: '💬' },
    { href: '#features', label: 'কেন আবাবিল', icon: '⭐' },
    { href: '#routine', label: 'ব্যথার জায়গা', icon: '📍' },
    { href: '#campaign', label: 'আপনজন', icon: '❤️' },
];

export default function Concept3({
    product,
    shippingAreas,
    contact,
    formToken,
    reviews,
    productImages,
    gallery,
    partners,
    orderPlaced,
    orderError,
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    contact: Contact;
    formToken: string;
    reviews: VideoReview[];
    productImages: { id: number; src: string; alt: string }[];
    gallery: Record<'features' | 'routine' | 'campaign', Concept3PhotoItem[]>;
    partners: Concept3Partner[];
    orderPlaced?: OrderPlacedData | null;
    orderError?: string | null;
}) {
    const checkout = useCheckoutForm({
        product,
        shippingAreas,
        formToken,
        orderPlaced,
        orderError,
    });
    // app.blade.php already skips rendering #lcp-placeholder for this exact
    // request when it knows server-side there's no product (so this is a
    // backstop, not the primary fix) - but Concept3Banner is what removes
    // the placeholder otherwise, and it never mounts on this fallback, so
    // nothing else ever would.
    useEffect(() => {
        if (!product) {
            document.getElementById('lcp-placeholder')?.remove();
        }
    }, [product]);

    if (!product) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-amber-50 p-6 text-center">
                <p className="font-bengali text-stone-500">
                    এই মুহূর্তে কোনো পণ্য পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন।
                </p>
            </div>
        );
    }

    // The order form lives on the page (in the product section) - every
    // "অর্ডার করুন" button just brings it into view. A plain scroll, not a
    // hash navigation or a modal, so it can't reload Facebook's in-app
    // browser. On desktop the whole product section (photos + form) fits on
    // one screen, so that's what it scrolls to; on a phone the photos stack
    // above the form, so it goes straight to the form.
    const scrollToCheckout = () => {
        const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

        document
            .getElementById(isDesktop ? 'product' : 'order-form')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const isLinkVisible = (href: string) => {
        const section = gallerySectionByHref[href];

        return !section || gallery[section].length > 0;
    };

    return (
        <LazyMotion features={loadMotionFeatures}>
            <div
                id="top"
                className="min-h-screen bg-white font-sans text-stone-900"
            >
                <SiteHeader
                    phone={contact.phone}
                    navLinks={navLinks.filter((link) =>
                        isLinkVisible(link.href),
                    )}
                    mobileNavLinks={mobileNavLinks.filter((link) =>
                        isLinkVisible(link.href),
                    )}
                    orderHref="#product"
                    onOrderClick={scrollToCheckout}
                />

                <main>
                    <Concept3Banner onOrderClick={scrollToCheckout} />
                    {partners.length > 0 && (
                        <Concept3CertificationSection items={partners} />
                    )}
                    <Concept3ProductSection
                        productName={product.name}
                        images={productImages}
                        checkout={checkout}
                        onOrderClick={scrollToCheckout}
                    />

                    <Suspense fallback={<div className="min-h-[400px]" />}>
                        <Concept3MapSection onOrderClick={scrollToCheckout} />
                    </Suspense>

                    <Suspense fallback={<div className="min-h-[300px]" />}>
                        <TestimonialsSection reviews={reviews} />
                    </Suspense>

                    {gallery.features.length > 0 && (
                        <Suspense fallback={<div className="min-h-[400px]" />}>
                            <Concept3PhotoGallery
                                id="features"
                                heading="সবার স্বস্তি, সবার যত্ন"
                                subtitle="নিজের ও প্রিয়জনের প্রতিদিনের ব্যথা দূর করতে ভরসা থাকুক— আবাবিল পেইন রিলিফ অয়েল।"
                                items={gallery.features}
                                onOrderClick={scrollToCheckout}
                            />
                        </Suspense>
                    )}

                    {gallery.routine.length > 0 && (
                        <Suspense fallback={<div className="min-h-[300px]" />}>
                            <Concept3RoutineSection items={gallery.routine} />
                        </Suspense>
                    )}

                    {gallery.campaign.length > 0 && (
                        <Suspense fallback={<div className="min-h-[400px]" />}>
                            <Concept3PhotoGallery
                                id="campaign"
                                heading="চেনা জীবনের যত্ন"
                                subtitle="আপনজনের ব্যথা কমুক, ফিরুক চেনা হাসি।"
                                items={gallery.campaign}
                                onOrderClick={scrollToCheckout}
                            />
                        </Suspense>
                    )}

                    <Suspense fallback={<div className="min-h-[300px]" />}>
                        <Concept3FaqSection />
                    </Suspense>
                    <Suspense fallback={<div className="min-h-[200px]" />}>
                        <Concept3ContactSection whatsapp={contact.whatsapp} />
                    </Suspense>
                </main>

                <SiteFooter phone={contact.phone} />

                <FloatingActions
                    whatsapp={contact.whatsapp}
                    facebookUrl={contact.facebookUrl}
                />

                <Concept3StickyBar onOrderClick={scrollToCheckout} />

                <Suspense fallback={null}>
                    <OrderResultDialog
                        result={checkout.orderResult}
                        onClose={checkout.clearOrderResult}
                    />
                </Suspense>
            </div>
        </LazyMotion>
    );
}
