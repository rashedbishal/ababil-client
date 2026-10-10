import { Leaf, ShieldCheck, Star, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import OrderTriggerButton from './order-trigger-button';

const trustItems = [
    {
        icon: Leaf,
        title: 'প্রাকৃতিক উপাদান',
        subtitle: 'প্রকৃতি থেকে দৈনন্দিন যত্ন',
    },
    {
        icon: Truck,
        title: 'সারা দেশে ডেলিভারি',
        subtitle: 'আপনার দরজায় পৌঁছে যাবে',
    },
    {
        icon: ShieldCheck,
        title: 'ক্যাশ অন ডেলিভারি',
        subtitle: 'হাতে পেয়ে মূল্য পরিশোধ',
    },
];

const AUTO_SLIDE_MS = 2500;

/**
 * Concept 3's product section is deliberately minimal - no price, no
 * quantity stepper here (those live in the order drawer). Just the product
 * photos and a single "অর্ডার করুন" button, matching the design's
 * `.simple-product` treatment.
 */
export default function Concept3ProductSection({
    productName,
    images,
    onOrderClick,
}: {
    productName: string;
    images: { id: string | number; src: string; alt: string }[];
    onOrderClick: () => void;
}) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const active = images[index];

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, AUTO_SLIDE_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [images.length]);

    return (
        <section
            id="product"
            className="scroll-mt-24 bg-gradient-to-b from-amber-50 via-white to-amber-50"
        >
            <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-8 sm:py-14">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <button
                            type="button"
                            onClick={onOrderClick}
                            aria-label={`${productName} — অর্ডার করুন`}
                            className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-stone-950 p-6 shadow-2xl shadow-amber-900/20"
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_70%)]"
                            />

                            <span className="absolute top-4 left-4 flex items-center gap-1 rounded-full border border-amber-400/40 bg-stone-950/85 px-3 py-1 font-bengali text-xs font-semibold text-amber-300 shadow-md backdrop-blur-md">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                ২০০ মি.লি. • অরিজিনাল পণ্য
                            </span>

                            <AnimatePresence mode="wait">
                                {active && (
                                    <motion.img
                                        key={active.id}
                                        src={active.src}
                                        alt={active.alt}
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative max-h-full w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
                                    />
                                )}
                            </AnimatePresence>
                        </button>

                        <div className="mt-4 grid grid-cols-4 gap-3">
                            {images.map((img, i) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setIndex(i)}
                                    aria-label={`${img.alt} দেখুন`}
                                    aria-pressed={i === index}
                                    className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 p-1.5 transition-all duration-300 ${
                                        i === index
                                            ? 'scale-105 border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-400/50'
                                            : 'border-amber-200 bg-white opacity-75 hover:border-amber-400 hover:opacity-100'
                                    }`}
                                >
                                    <img
                                        src={img.src}
                                        alt={img.alt}
                                        className="size-full object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center pt-3">
                        <h1 className="font-bengali text-3xl font-extrabold text-stone-900 sm:text-4xl">
                            {productName}
                        </h1>

                        <div className="mt-6">
                            <OrderTriggerButton
                                onClick={onOrderClick}
                                className="w-full max-w-[360px] justify-center"
                            >
                                অর্ডার করুন
                            </OrderTriggerButton>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col divide-y divide-amber-100 border-t border-b border-amber-100 sm:mt-10 sm:flex-row sm:divide-x sm:divide-y-0">
                    {trustItems.map(({ icon: Icon, title, subtitle }) => (
                        <div
                            key={title}
                            className="grid grid-cols-[42px_1fr] items-center gap-3.5 px-1 py-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:py-6 sm:text-center"
                        >
                            <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-amber-100 text-amber-700">
                                <Icon className="size-6" />
                            </span>
                            <div>
                                <b className="block font-bengali text-base font-bold text-stone-900">
                                    {title}
                                </b>
                                <small className="mt-0.5 block font-bengali text-sm text-stone-500">
                                    {subtitle}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
