import CheckoutDialog from '@/components/landing/checkout-dialog';
import FloatingActions from '@/components/landing/floating-actions';
import GallerySection from '@/components/landing/gallery-section';
import HeroSection from '@/components/landing/hero-section';
import NationwideSection from '@/components/landing/nationwide-section';
import OrderResultDialog from '@/components/landing/order-result-dialog';
import ProductPaymentSection from '@/components/landing/product-payment-section';
import SiteFooter from '@/components/landing/site-footer';
import SiteHeader from '@/components/landing/site-header';
import { useCheckoutForm } from '@/hooks/use-checkout-form';
import type { Contact, Product, ShippingArea } from '@/types/storefront';
import { useEffect, useState } from 'react';

import ingAngelica from '../../images/landing/cards/ing-angelica.webp';
import ingArnica from '../../images/landing/cards/ing-arnica.webp';
import ingBoswellia from '../../images/landing/cards/ing-boswellia.webp';
import ingChuanxiong from '../../images/landing/cards/ing-chuanxiong.webp';
import ingEucalyptus from '../../images/landing/cards/ing-eucalyptus.webp';
import ingLaurocapram from '../../images/landing/cards/ing-laurocapram.webp';
import ingNeroli from '../../images/landing/cards/ing-neroli.webp';
import ingTeatree from '../../images/landing/cards/ing-teatree.webp';
import ingVitamine from '../../images/landing/cards/ing-vitamine.webp';
import problemBack from '../../images/landing/cards/problem-back.webp';
import problemFeet from '../../images/landing/cards/problem-feet.webp';
import problemKnee from '../../images/landing/cards/problem-knee.webp';
import problemMuscle from '../../images/landing/cards/problem-muscle.webp';
import problemNeck from '../../images/landing/cards/problem-neck.webp';
import usageAmount from '../../images/landing/cards/usage-amount-full.webp';
import usageCleanArea from '../../images/landing/cards/usage-clean-area-full.webp';
import usageMassage from '../../images/landing/cards/usage-massage-full.webp';
import usageRoutine from '../../images/landing/cards/usage-routine-full.webp';
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

const productGallery = [
    { id: 1, image: product1, alt: 'আবাবিল অয়েল ফ্রন্ট ভিউ' },
    { id: 2, image: product2, alt: 'আবাবিল অয়েল এঙ্গেল ভিউ' },
    { id: 3, image: product3, alt: 'আবাবিল অয়েল প্রফেশনাল ভিউ' },
    { id: 4, image: product4, alt: 'আবাবিল অয়েল প্যাক ভিউ' },
];

const productViewerImages = productGallery.map((item) => ({
    id: item.id,
    src: item.image,
    alt: item.alt,
}));

const ingredientGallery = [
    { id: 'angelica', image: ingAngelica, alt: 'অ্যাঞ্জেলিকা' },
    { id: 'arnica', image: ingArnica, alt: 'আরনিকা' },
    { id: 'boswellia', image: ingBoswellia, alt: 'বোসওয়েলিয়া' },
    { id: 'chuanxiong', image: ingChuanxiong, alt: 'চুয়ানজিয়ং' },
    { id: 'eucalyptus', image: ingEucalyptus, alt: 'ইউক্যালিপটাস' },
    { id: 'laurocapram', image: ingLaurocapram, alt: 'লরোক্যাপ্রাম' },
    { id: 'neroli', image: ingNeroli, alt: 'নেরোলি' },
    { id: 'teatree', image: ingTeatree, alt: 'টি ট্রি' },
    { id: 'vitamine', image: ingVitamine, alt: 'ভিটামিন ই' },
];

const reliefAreaGallery = [
    { id: 'knee', image: problemKnee, alt: 'হাঁটু ও জয়েন্টের ব্যথা' },
    { id: 'back', image: problemBack, alt: 'পিঠ ও কোমরের ব্যথা' },
    { id: 'feet', image: problemFeet, alt: 'পা ও গোড়ালির ব্যথা' },
    { id: 'neck', image: problemNeck, alt: 'ঘাড় ও কাঁধের ব্যথা' },
    { id: 'muscle', image: problemMuscle, alt: 'পেশির টান' },
];

const usageGallery = [
    { id: 'cleanse', image: usageCleanArea, alt: 'ক্লিনজ' },
    { id: 'dispense', image: usageAmount, alt: 'পরিমাণমতো নিন' },
    { id: 'massage', image: usageMassage, alt: 'আলতো ম্যাসাজ' },
    { id: 'routine', image: usageRoutine, alt: 'নিয়মিত ব্যবহার' },
];

const uspGallery = [
    { id: 'warming', image: uspWarming, alt: 'থেরাপিউটিক ওয়ার্মিং' },
    { id: 'nonsticky', image: uspNonsticky, alt: 'নন-স্টিকি ড্রাই ফর্মুলা' },
    { id: 'absorption', image: uspAbsorption, alt: 'দ্রুত শোষণ' },
    { id: 'massage-usp', image: uspMassage, alt: 'সহজ ম্যাসাজ' },
    { id: 'herbal', image: uspHerbal, alt: 'হারবাল ফর্মুলেশন' },
    { id: 'skincare', image: uspSkincare, alt: 'স্কিন কেয়ার' },
];

export default function Concept1({
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
        <div className="min-h-screen bg-amber-50 font-sans text-stone-900">
            <SiteHeader phone={contact.phone} />

            <main>
                <HeroSection />
                <NationwideSection />

                <GallerySection
                    id="gallery-product"
                    eyebrow="পণ্য পরিচিতি"
                    heading="আবাবিল অয়েল"
                    items={productGallery}
                    layout="image-only"
                />
                <GallerySection
                    id="gallery-ingredients"
                    eyebrow="প্রাকৃতিক উপাদান"
                    heading="যা দিয়ে তৈরি আবাবিল"
                    items={ingredientGallery}
                    layout="image-only"
                />
                <GallerySection
                    id="gallery-relief"
                    eyebrow="যেখানে কাজ করে"
                    heading="ব্যথা উপশমের স্থান"
                    items={reliefAreaGallery}
                    layout="image-only"
                />
                <GallerySection
                    id="gallery-usage"
                    eyebrow="ব্যবহার পদ্ধতি"
                    heading="যেভাবে ব্যবহার করবেন"
                    items={usageGallery}
                    layout="image-only"
                />
                <GallerySection
                    id="gallery-usp"
                    eyebrow="কেন আবাবিল"
                    heading="আবাবিলের বিশেষত্ব"
                    items={uspGallery}
                    layout="image-only"
                />

                <ProductPaymentSection
                    productName={product.name}
                    images={productViewerImages}
                    checkout={checkout}
                    onOrderNowClick={() => setDialogOpen(true)}
                />
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
                showQuantity={false}
            />

            <OrderResultDialog
                result={checkout.orderResult}
                onClose={checkout.clearOrderResult}
            />
        </div>
    );
}
