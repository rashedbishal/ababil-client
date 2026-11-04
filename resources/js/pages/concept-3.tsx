import { LazyMotion } from 'motion/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import Concept3Banner from '@/components/landing/concept3-banner';
import Concept3CertificationSection from '@/components/landing/concept3-certification-section';
import Concept3MapSection from '@/components/landing/concept3-map-section';
import Concept3OrderDrawer from '@/components/landing/concept3-order-drawer';
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
// Blocking Time contributor. The order drawer is imported eagerly so a
// tap can open it immediately; a lazy chunk that hadn't loaded yet left
// Facebook's in-app browser with a blank tap and a page reset.
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

import product1 from '../../images/landing/product/product-1.webp';
import product2 from '../../images/landing/product/product-2.webp';
import product3 from '../../images/landing/product/product-3.webp';
import product4 from '../../images/landing/product/product-4.webp';

const productImages = [
    { id: 1, src: product1, alt: 'আবাবিল পণ্যের ১ নম্বর ছবি' },
    { id: 2, src: product2, alt: 'আবাবিল পণ্যের ২ নম্বর ছবি' },
    { id: 3, src: product3, alt: 'আবাবিল পণ্যের ৩ নম্বর ছবি' },
    { id: 4, src: product4, alt: 'আবাবিল পণ্যের ৪ নম্বর ছবি' },
];

// Concept 3's sections have their own ids (set on Concept3MapSection,
// Concept3PhotoGallery, Concept3RoutineSection and Concept3ProductSection
// below) rather than the main design's #problem/#usp/#lab-tested/#checkout,
// so the shared SiteHeader needs its own nav list for this page, ordered to
// match how the sections actually appear on the page.
const navLinks: NavLink[] = [
    { href: '#delivery', label: 'ডেলিভারি' },
    { href: '#features', label: 'কেন আবাবিল' },
    { href: '#routine', label: 'ব্যথার জায়গা' },
    { href: '#campaign', label: 'আপনজন' },
    { href: '#product', label: 'পেমেন্ট' },
    { href: '#reviews', label: 'রিভিউ' },
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
    { href: '#delivery', label: 'ডেলিভারি', icon: '🚚' },
    { href: '#features', label: 'কেন আবাবিল', icon: '⭐' },
    { href: '#routine', label: 'ব্যথার জায়গা', icon: '📍' },
    { href: '#campaign', label: 'আপনজন', icon: '❤️' },
    { href: '#product', label: 'পেমেন্ট', icon: '💳' },
    { href: '#reviews', label: 'রিভিউ', icon: '💬' },
];

export default function Concept3({
    product,
    shippingAreas,
    contact,
    formToken,
    reviews,
    gallery,
    orderPlaced,
    orderError,
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    contact: Contact;
    formToken: string;
    reviews: VideoReview[];
    gallery: Record<'features' | 'routine' | 'campaign', Concept3PhotoItem[]>;
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
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (checkout.orderResult) {
            setDrawerOpen(false);
        }
    }, [checkout.orderResult]);

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

    const openDrawer = () => setDrawerOpen(true);

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
                    onOrderClick={openDrawer}
                />

                <main>
                    <Concept3Banner onOrderClick={openDrawer} />
                    <Concept3CertificationSection />
                    <Concept3MapSection onOrderClick={openDrawer} />

                    {gallery.features.length > 0 && (
                        <Suspense fallback={<div className="min-h-[400px]" />}>
                            <Concept3PhotoGallery
                                id="features"
                                heading="সবার স্বস্তি, সবার যত্ন"
                                subtitle="নিজের ও প্রিয়জনের প্রতিদিনের ব্যথা দূর করতে ভরসা থাকুক— আবাবিল পেইন রিলিফ অয়েল।"
                                items={gallery.features}
                                onOrderClick={openDrawer}
                                columns={2}
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
                                onOrderClick={openDrawer}
                                columns={2}
                            />
                        </Suspense>
                    )}

                    <Concept3ProductSection
                        productName={product.name}
                        images={productImages}
                        checkout={checkout}
                        onOrderClick={openDrawer}
                    />

                    <Suspense fallback={<div className="min-h-[300px]" />}>
                        <TestimonialsSection reviews={reviews} />
                    </Suspense>

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

                <Concept3StickyBar onOrderClick={openDrawer} />

                <Concept3OrderDrawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    productName={product.name}
                    images={productImages}
                    checkout={checkout}
                />

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
