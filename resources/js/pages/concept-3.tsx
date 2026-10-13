import { useEffect, useState } from 'react';
import Concept3Banner from '@/components/landing/concept3-banner';
import Concept3CertificationSection from '@/components/landing/concept3-certification-section';
import Concept3ContactSection from '@/components/landing/concept3-contact-section';
import Concept3FaqSection from '@/components/landing/concept3-faq-section';
import Concept3MapSection from '@/components/landing/concept3-map-section';
import Concept3OrderDrawer from '@/components/landing/concept3-order-drawer';
import type { Concept3PhotoItem } from '@/components/landing/concept3-photo-gallery';
import Concept3PhotoGallery from '@/components/landing/concept3-photo-gallery';
import Concept3ProductSection from '@/components/landing/concept3-product-section';
import Concept3RoutineSection from '@/components/landing/concept3-routine-section';
import Concept3StickyBar from '@/components/landing/concept3-sticky-bar';
import FloatingActions from '@/components/landing/floating-actions';
import OrderResultDialog from '@/components/landing/order-result-dialog';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader, {
    type MobileNavLink,
    type NavLink,
} from '@/components/landing/site-header';
import TestimonialsSection from '@/components/landing/testimonials-section';
import { useCheckoutForm } from '@/hooks/use-checkout-form';
import type {
    Contact,
    Product,
    ShippingArea,
    VideoReview,
} from '@/types/storefront';

import campaignFatherShoulders from '../../images/landing/cards/campaign-father-shoulders.webp';
import campaignGrandpaGrandson from '../../images/landing/cards/campaign-grandpa-grandson.webp';
import campaignNeckKitchen from '../../images/landing/cards/campaign-neck-kitchen.webp';
import campaignSonFather from '../../images/landing/cards/campaign-son-father.webp';
import careFootWalk from '../../images/landing/cards/care-foot-walk.webp';
import careKneeBazaar from '../../images/landing/cards/care-knee-bazaar.webp';
import careNeckWarmth from '../../images/landing/cards/care-neck-warmth.webp';
import problemBack from '../../images/landing/cards/problem-back.webp';
import problemFeet from '../../images/landing/cards/problem-feet.webp';
import problemNeck from '../../images/landing/cards/problem-neck.webp';
import uspHerbal from '../../images/landing/cards/usp-herbal-original.webp';
import uspWarming from '../../images/landing/cards/usp-warming-original.webp';
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

// No photo appears in more than one section of the page. "সবার স্বস্তি,
// সবার যত্ন" shows people of every age - a child to a grandparent - each
// dealing with their own pain (not being massaged by someone else), across
// every body area - neck, shoulder, back, knee and foot. "চেনা জীবনের যত্ন"
// is the emotional, family-centred section.
const featureItems: Concept3PhotoItem[] = [
    {
        id: 'herbal',
        image: uspHerbal,
        alt: 'আবাবিল অয়েল হাতে হাসিমুখে একজন মা',
        caption: 'সংসারের সবার ভরসা',
    },
    {
        id: 'knee-bazaar',
        image: careKneeBazaar,
        alt: 'রাস্তায় হাসিমুখে থাম্বস আপ দেখিয়ে দৌড়াচ্ছেন একজন পুরুষ',
        caption: 'ব্যথাকে পিছনে ফেলে এগিয়ে চলুন',
    },
    {
        id: 'foot-walk',
        image: careFootWalk,
        alt: 'সারাদিন হাঁটার পর পায়ের গোড়ালিতে ব্যথা',
        caption: 'সারাদিন হাঁটার পর পায়ে আরাম',
    },
    {
        id: 'back',
        image: problemBack,
        alt: 'অফিস চেয়ারে বসে নিজের পিঠে হাত রেখেছেন একজন যুবক',
        caption: 'পিঠের খবর নিন নিজেই',
    },
    {
        id: 'neck-warmth',
        image: careNeckWarmth,
        alt: 'ঘাড়ের ব্যথায় হাত রেখেছেন একজন যুবক',
        caption: 'ঘাড়ে লাগাতেই আরামের উষ্ণতা',
    },
    {
        id: 'warming',
        image: uspWarming,
        alt: 'স্কুলব্যাগ কাঁধে হাসিমুখে এক শিশু',
        caption: 'ব্যাগের ভারে কাঁধ ব্যথায় আরাম',
    },
];

const campaignItems: Concept3PhotoItem[] = [
    {
        id: 'grandpa-grandson',
        image: campaignGrandpaGrandson,
        alt: 'লাঠি ছাড়াই নাতির হাত ধরে হাঁটছেন দাদু',
        caption: 'লাঠি নয়, নাতির হাত ধরে দাদু',
    },
    {
        id: 'neck',
        image: problemNeck,
        alt: 'মায়ের কাঁধে মেয়ের যত্নের হাত',
        caption: 'মায়ের কাঁধেও একটু যত্ন',
    },
    {
        id: 'father-shoulders',
        image: campaignFatherShoulders,
        alt: 'বাবার কাঁধে চড়ে আনন্দে দুই হাত মেলে দিয়েছে সন্তান',
        caption: 'বাবার কাঁধেই সন্তানের আশ্রয়',
    },
    {
        id: 'son-father',
        image: campaignSonFather,
        alt: 'বৃদ্ধ বাবার কাঁধে হাত রেখে পাশে দাঁড়িয়ে ছেলে',
        caption: 'মা-বাবার জন্য সেরা উপহার',
    },
    {
        id: 'feet',
        image: problemFeet,
        alt: 'জায়নামাজে সিজদারত একজন মুসল্লি',
        caption: 'নামাজে স্বস্তি, সিজদায় আরাম',
    },
    {
        id: 'neck-kitchen',
        image: campaignNeckKitchen,
        alt: 'রান্নার ফাঁকে ঘাড়ে হাত রেখেছেন একজন গৃহিণী',
        caption: 'রান্নাঘরেও ঘাড় থাকুক আরামে',
    },
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
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
    contact: Contact;
    formToken: string;
    reviews: VideoReview[];
}) {
    const checkout = useCheckoutForm({ product, shippingAreas, formToken });
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (checkout.orderResult) {
            setDrawerOpen(false);
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

    const openDrawer = () => setDrawerOpen(true);

    // Every "অর্ডার করুন" button on the page scrolls to the payment section
    // first - quantity and the delivery-area picker live there - and only
    // that section's own button (see Concept3ProductSection below) opens
    // the drawer directly.
    const scrollToProduct = () => {
        document
            .getElementById('product')
            ?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            id="top"
            className="min-h-screen bg-white font-sans text-stone-900"
        >
            <SiteHeader
                phone={contact.phone}
                navLinks={navLinks}
                mobileNavLinks={mobileNavLinks}
                orderHref="#product"
            />

            <main>
                <Concept3Banner onOrderClick={scrollToProduct} />
                <Concept3CertificationSection />
                <Concept3MapSection onOrderClick={scrollToProduct} />

                <Concept3PhotoGallery
                    id="features"
                    heading="সবার স্বস্তি, সবার যত্ন"
                    subtitle="নিজের ও প্রিয়জনের প্রতিদিনের ব্যথা দূর করতে ভরসা থাকুক— আবাবিল পেইন রিলিফ অয়েল।"
                    items={featureItems}
                    onOrderClick={scrollToProduct}
                    columns={3}
                />

                <Concept3RoutineSection />

                <Concept3PhotoGallery
                    id="campaign"
                    heading="চেনা জীবনের যত্ন"
                    subtitle="আপনজনের ব্যথা কমুক, ফিরুক চেনা হাসি।"
                    items={campaignItems}
                    onOrderClick={scrollToProduct}
                    columns={3}
                />

                <Concept3ProductSection
                    productName={product.name}
                    images={productImages}
                    checkout={checkout}
                    onOrderClick={openDrawer}
                />

                <TestimonialsSection reviews={reviews} />

                <Concept3FaqSection />
                <Concept3ContactSection whatsapp={contact.whatsapp} />
            </main>

            <SiteFooter phone={contact.phone} />

            <FloatingActions
                whatsapp={contact.whatsapp}
                facebookUrl={contact.facebookUrl}
            />

            <Concept3StickyBar onOrderClick={scrollToProduct} />

            <Concept3OrderDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
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
