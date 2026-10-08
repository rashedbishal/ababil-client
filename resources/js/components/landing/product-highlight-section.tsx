import { ShieldCheck, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import Magnetic from './motion/magnetic';
import PriceReveal from './motion/price-reveal';
import Reveal from './motion/reveal';
import OrderButton from './order-button';

import product1 from '../../../images/landing/product/product-1.webp';
import product2 from '../../../images/landing/product/product-2.webp';
import product3 from '../../../images/landing/product/product-3.webp';
import product4 from '../../../images/landing/product/product-4.webp';

const productImages = [
    { id: 1, src: product1, alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল বোটল ১' },
    { id: 2, src: product2, alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল বোটল ২' },
    { id: 3, src: product3, alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল বোটল ৩' },
    { id: 4, src: product4, alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল বোটল ৪' },
];

export default function ProductHighlightSection({
    regularPrice = '1150',
    salePrice = '791',
}: {
    regularPrice?: string;
    salePrice?: string | null;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % productImages.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [isPaused]);

    const activeProduct = productImages[activeIndex];

    return (
        <section
            id="product-highlight"
            className="relative overflow-hidden bg-stone-950 py-8 text-white select-none sm:py-14"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Ambient Lighting */}
            <div
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-1/2 -z-0 hidden size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl md:block"
            />

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
                    {/* Left Column: Interactive Product Showcase */}
                    <div className="flex flex-col items-center lg:col-span-6">
                        <Reveal className="relative w-full max-w-md">
                            {/* Main Product Stage Box */}
                            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-stone-900/90 via-stone-900/60 to-stone-950/90 p-6 shadow-2xl shadow-black/80 sm:p-8">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15),transparent_65%)]"
                                />

                                <a
                                    href="#checkout"
                                    aria-label="অর্ডার করতে ক্লিক করুন"
                                    className="relative flex size-full items-center justify-center"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={activeProduct.id}
                                            src={activeProduct.src}
                                            alt={activeProduct.alt}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.92,
                                                y: 10,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                scale: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                scale: 0.92,
                                                y: -10,
                                            }}
                                            transition={{
                                                duration: 0.4,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                            loading="lazy"
                                            decoding="async"
                                            className="relative max-h-full w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.8)]"
                                        />
                                    </AnimatePresence>
                                </a>

                                {/* Rating Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full border border-amber-400/30 bg-stone-950/80 px-3 py-1 text-xs font-semibold text-amber-300 shadow-md">
                                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                    <span>৪.৯ (৫০০০+ রিভিউ)</span>
                                </div>
                            </div>

                            {/* Product Thumbnails Switcher */}
                            <div className="mt-4 flex items-center justify-center gap-3">
                                {productImages.map((prod, idx) => (
                                    <button
                                        key={prod.id}
                                        type="button"
                                        onClick={() => setActiveIndex(idx)}
                                        className={`relative flex size-14 items-center justify-center overflow-hidden rounded-xl border-2 p-1 transition-all duration-300 sm:size-16 ${
                                            idx === activeIndex
                                                ? 'scale-105 border-amber-400 bg-amber-500/20 shadow-lg shadow-amber-500/30'
                                                : 'border-stone-800 bg-stone-900/80 opacity-60 hover:border-stone-600 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={prod.src}
                                            alt={prod.alt}
                                            loading="lazy"
                                            decoding="async"
                                            className="size-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    {/* Right Column: Pricing & Product Details */}
                    <div className="flex flex-col items-start text-left lg:col-span-6">
                        <Reveal>
                            {/* Prominent 3-Day Return Policy Highlight Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-r from-amber-500/20 via-stone-900/90 to-amber-500/15 p-4 shadow-xl shadow-amber-500/15 backdrop-blur-md sm:p-5"
                            >
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-amber-400/20 blur-2xl"
                                />
                                <div className="flex items-center gap-3.5">
                                    <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/30">
                                        <ShieldCheck className="size-7 text-stone-950" />
                                        <span className="absolute -top-1 -right-1 flex size-3">
                                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-300 opacity-75" />
                                            <span className="relative inline-flex size-3 rounded-full bg-amber-400" />
                                        </span>
                                    </div>
                                    <div className="font-bengali">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-md border border-amber-400/40 bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-amber-300 uppercase">
                                                ১০০% ঝুঁকিমুক্ত কেনাকাটা
                                            </span>
                                        </div>
                                        <h3 className="mt-1 text-base font-extrabold text-amber-300 sm:text-lg">
                                            ৩ দিনের রিটার্ন ও মানি-ব্যাক পলিসি
                                        </h3>
                                        <p className="mt-0.5 text-xs leading-snug text-stone-300 sm:text-sm">
                                            পণ্য হাতে পেয়ে ব্যবহার করে সন্তুষ্ট না হলে ৩
                                            দিনের মধ্যে সম্পূর্ণ টাকা ফেরতের নিশ্চয়তা!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section Title & Description */}
                            <h2 className="mt-4 font-bengali text-3xl leading-tight font-extrabold text-white sm:text-4xl lg:text-5xl">
                                আবাবিল অর্গানিক পেইন রিলিফ অয়েল
                            </h2>
                            <p className="mt-3 font-bengali text-sm leading-relaxed text-neutral-300 sm:text-base">
                                মহাঔষধী ভেষজের বিশেষ গুণসম্পন্ন ১০০% প্রাকৃতিক ম্যাসাজ
                                তেল। নিয়মিত ব্যবহারে হাঁটু, কোমর ও ঘাড় ব্যথায় পান দ্রুত
                                আরামদায়ক উপশম।
                            </p>

                            {/* Price Card Container */}
                            <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-amber-500/30 bg-stone-900/70 p-4 sm:p-5">
                                <div className="flex items-baseline gap-3 font-bengali">
                                    {salePrice && (
                                        <span className="text-lg text-stone-400 line-through sm:text-2xl">
                                            ৳{regularPrice}
                                        </span>
                                    )}
                                    <span className="text-4xl font-black tracking-tight text-amber-400 drop-shadow-md sm:text-5xl">
                                        <PriceReveal
                                            prefix="৳"
                                            from={Number(regularPrice)}
                                            to={Number(
                                                salePrice ?? regularPrice,
                                            )}
                                        />
                                    </span>
                                    <span className="text-xs font-medium text-stone-300">
                                        মাত্র
                                    </span>
                                </div>
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 font-bengali text-xs font-bold text-emerald-300">
                                    স্পেশাল অফার চলমান
                                </span>
                            </div>

                            {/* Feature Checklist */}
                            <ul className="mt-6 space-y-2.5 font-bengali text-sm text-neutral-200">
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-4 shrink-0 text-amber-400" />
                                    <span>১০ মিনিটে দ্রুত ব্যথার উপশম শুরু</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-4 shrink-0 text-amber-400" />
                                    <span>
                                        নন-স্টিকি, দ্রুত ত্বকে শোষিত হয় — কাপড়ে দাগ
                                        লাগে না
                                    </span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck className="size-4 shrink-0 text-amber-400" />
                                    <span>৩ দিনের ঝুঁকিমুক্ত মানি-ব্যাক গ্যারান্টি</span>
                                </li>
                            </ul>

                            {/* CTA Order Button */}
                            <div className="mt-8">
                                <Magnetic>
                                    <OrderButton
                                        href="#checkout"
                                        size="lg"
                                        className="shadow-xl shadow-amber-500/20"
                                    >
                                        এখনই অর্ডার করুন
                                    </OrderButton>
                                </Magnetic>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
