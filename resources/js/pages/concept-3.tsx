import { useEffect, useState } from 'react';
import Concept3Banner from '@/components/landing/concept3-banner';
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
import SiteHeader from '@/components/landing/site-header';
import TestimonialsSection from '@/components/landing/testimonials-section';
import { useCheckoutForm } from '@/hooks/use-checkout-form';
import type { Contact, Product, ShippingArea } from '@/types/storefront';

import problemBack from '../../images/landing/cards/problem-back.webp';
import problemFeet from '../../images/landing/cards/problem-feet.webp';
import problemKnee from '../../images/landing/cards/problem-knee.webp';
import problemMuscle from '../../images/landing/cards/problem-muscle.webp';
import problemNeck from '../../images/landing/cards/problem-neck.webp';
import uspAbsorption from '../../images/landing/cards/usp-absorption-original.webp';
import uspHerbal from '../../images/landing/cards/usp-herbal-original.webp';
import uspMassage from '../../images/landing/cards/usp-massage-original.webp';
import uspNonsticky from '../../images/landing/cards/usp-nonsticky-original.webp';
import uspSkincare from '../../images/landing/cards/usp-skincare-original.webp';
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

const featureItems: Concept3PhotoItem[] = [
    {
        id: 'herbal',
        image: uspHerbal,
        alt: 'প্রাকৃতিক উপাদানের পরিচয়',
        caption: 'প্রকৃতির ছোঁয়া',
    },
    {
        id: 'absorption',
        image: uspAbsorption,
        alt: 'আবাবিল দৈনন্দিন যত্ন',
        caption: 'প্রিয়জনের খেয়াল',
    },
    {
        id: 'massage',
        image: uspMassage,
        alt: 'ম্যাসাজের যত্ন',
        caption: 'ব্যস্ত দিনের বিরতি',
    },
    {
        id: 'nonsticky',
        image: uspNonsticky,
        alt: 'ম্যাসাজের অভিজ্ঞতা',
        caption: 'একটু নিজের সময়',
    },
    {
        id: 'skincare',
        image: uspSkincare,
        alt: 'নিজের যত্ন',
        caption: 'যত্নের ছোট্ট অভ্যাস',
    },
    {
        id: 'warming',
        image: uspWarming,
        alt: 'ঘাড়ের ব্যথায় যত্নের ছবি',
        caption: 'ঘাড়ের ব্যথায় একটু যত্ন',
    },
];

const campaignItems: Concept3PhotoItem[] = [
    {
        id: 'knee',
        image: problemKnee,
        alt: 'হাঁটুর যত্ন',
        caption: 'পথচলা থাকুক আপন',
    },
    {
        id: 'neck',
        image: problemNeck,
        alt: 'ঘাড়ের যত্ন',
        caption: 'মায়ের জন্য একটু সময়',
    },
    {
        id: 'back',
        image: problemBack,
        alt: 'পিঠের যত্ন',
        caption: 'কাজের ফাঁকে নিজের যত্ন',
    },
    {
        id: 'muscle',
        image: problemMuscle,
        alt: 'দৈনন্দিন চলাফেরা',
        caption: 'আপনজনের সঙ্গে সময়',
    },
    {
        id: 'feet',
        image: problemFeet,
        alt: 'পায়ের যত্ন',
        caption: 'সারাদিনের পরে বিরতি',
    },
];

export default function Concept3({
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

    return (
        <div
            id="top"
            className="min-h-screen bg-white font-sans text-stone-900"
        >
            <SiteHeader phone={contact.phone} />

            <main>
                <Concept3Banner onOrderClick={openDrawer} />
                <Concept3MapSection onOrderClick={openDrawer} />

                <Concept3PhotoGallery
                    id="features"
                    heading="নিজের যত্নও জরুরি"
                    subtitle="সবার খেয়াল রাখেন। এবার একটু নিজেরও।"
                    items={featureItems}
                    onOrderClick={openDrawer}
                    columns={3}
                />

                <Concept3RoutineSection />

                <Concept3PhotoGallery
                    id="campaign"
                    heading="চেনা জীবনের যত্ন"
                    subtitle="হাঁটাহাঁটি, কাজ আর আপনজনের পাশে থাকা।"
                    items={campaignItems}
                    onOrderClick={openDrawer}
                    columns={3}
                />

                <Concept3ProductSection
                    productName={product.name}
                    images={productImages}
                    onOrderClick={openDrawer}
                />

                <TestimonialsSection />

                <Concept3FaqSection />
                <Concept3ContactSection whatsapp={contact.whatsapp} />
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
                checkout={checkout}
            />

            <OrderResultDialog
                result={checkout.orderResult}
                onClose={checkout.clearOrderResult}
            />
        </div>
    );
}
