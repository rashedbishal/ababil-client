import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import warmingImg from '../../../images/landing/cards/usp-warming-original.webp';
import nonstickyImg from '../../../images/landing/cards/usp-nonsticky-original.webp';
import massageImg from '../../../images/landing/cards/usp-massage-original.webp';
import skincareImg from '../../../images/landing/cards/usp-skincare-original.webp';
import arnicaImg from '../../../images/landing/cards/usp-herbal-original.webp';
import vitamineImg from '../../../images/landing/cards/usp-absorption-original.webp';
import Reveal from './motion/reveal';

const bnDigits = ['১', '২', '৩', '৪', '৫', '৬'];

const usps = [
    {
        title: 'থেরাপিউটিক ওয়ার্মিং',
        description: 'ত্বকে প্রাকৃতিক উষ্ণতা তৈরি করে পেশি শিথিল করে।',
        image: warmingImg,
    },
    {
        title: 'নন-স্টিকি ড্রাই ফর্মুলা',
        description: 'ব্যবহারের পর কোনো আঠালো বা তৈলাক্ত ভাব থাকে না।',
        image: nonstickyImg,
    },
    {
        title: 'দ্রুত শোষণ',
        description: 'মাত্র ২-৩ মিনিটেই ত্বকে সম্পূর্ণ শোষিত হয়ে যায়।',
        image: vitamineImg,
    },
    {
        title: 'সহজ ম্যাসাজ',
        description: 'মসৃণ টেক্সচারের কারণে সহজেই ম্যাসাজ করা যায়।',
        image: massageImg,
    },
    {
        title: 'হারবাল ফর্মুলেশন',
        description: 'বহু প্রাকৃতিক ভেষজ উপাদানের অনন্য সংমিশ্রণ।',
        image: arnicaImg,
    },
    {
        title: 'স্কিন কেয়ার',
        description: 'ত্বকের বিবর্ণতা কমাতে সাহায্য করে, অ্যালার্জিক ত্বকেও নিরাপদ।',
        image: skincareImg,
    },
];

const TOTAL_USPS = usps.length; // 6 cards
// Duplicate array 3 times for 100% seamless infinite looping
const EXTENDED_USPS = [...usps, ...usps, ...usps];
const AUTO_SLIDE_INTERVAL = 2000; // 2 seconds fast & frequent auto slide

export default function UspSection() {
    // Start at middle loop set (index = TOTAL_USPS = 6)
    const [currentIndex, setCurrentIndex] = useState(TOTAL_USPS);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isDragging, setIsDragging] = useState(false);
    const [dragDeltaX, setDragDeltaX] = useState(0);

    const startXRef = useRef<number | null>(null);

    // Dynamic responsive visible cards count
    useEffect(() => {
        const updateVisibleCount = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setVisibleCount(3);
            } else if (width >= 640) {
                setVisibleCount(2);
            } else {
                setVisibleCount(1);
            }
        };

        updateVisibleCount();
        window.addEventListener('resize', updateVisibleCount);
        return () => window.removeEventListener('resize', updateVisibleCount);
    }, []);

    const slideNext = useCallback(() => {
        if (!isTransitioning) setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    }, [isTransitioning]);

    const slidePrev = useCallback(() => {
        if (!isTransitioning) setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    }, [isTransitioning]);

    // Fast, continuous auto-slide effect (never paused by mouse hover)
    useEffect(() => {
        if (isDragging) return;

        const timer = setInterval(() => {
            slideNext();
        }, AUTO_SLIDE_INTERVAL);

        return () => clearInterval(timer);
    }, [isDragging, slideNext]);

    // Seamless infinite loop jump when transition finishes
    const handleTransitionEnd = () => {
        if (currentIndex >= TOTAL_USPS * 2) {
            setIsTransitioning(false);
            setCurrentIndex(currentIndex - TOTAL_USPS);
        } else if (currentIndex < TOTAL_USPS) {
            setIsTransitioning(false);
            setCurrentIndex(currentIndex + TOTAL_USPS);
        }
    };

    // Pointer / Touch / Mouse Drag handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.button !== undefined && e.button !== 0) return;
        startXRef.current = e.clientX;
        setIsDragging(true);
        setDragDeltaX(0);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || startXRef.current === null) return;
        const deltaX = e.clientX - startXRef.current;
        setDragDeltaX(deltaX);
    };

    const handlePointerUp = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = 40;
        if (dragDeltaX < -threshold) {
            slideNext();
        } else if (dragDeltaX > threshold) {
            slidePrev();
        }

        setDragDeltaX(0);
        startXRef.current = null;
    };

    const handleDotClick = (index: number) => {
        setIsTransitioning(true);
        const currentMod =
            ((currentIndex % TOTAL_USPS) + TOTAL_USPS) % TOTAL_USPS;
        const diff = index - currentMod;
        setCurrentIndex((prev) => prev + diff);
    };

    // Exact active dot index (0 to 5)
    const activeDotIndex =
        ((currentIndex % TOTAL_USPS) + TOTAL_USPS) % TOTAL_USPS;

    return (
        <section
            id="usp"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-amber-50 via-white to-amber-100/60 py-8 select-none sm:py-14"
        >
            {/* Background Ambient Glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.12),transparent_60%)]"
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                {/* Static Compact Narrow Header */}
                <Reveal className="text-center">
                    <span className="mx-auto inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800">
                        বিশেষ বৈশিষ্ট্যসমূহ
                    </span>
                    <h2 className="mx-auto mt-3 max-w-xs text-center font-bengali text-2xl leading-tight font-bold text-stone-900 sm:max-w-md sm:text-3xl lg:text-4xl">
                        কেন আবাবিল বেছে নেবেন
                    </h2>
                </Reveal>

                {/* Infinite Loop Auto-Slider Container */}
                <div className="relative mt-10 sm:mt-14">
                    {/* Navigation Buttons */}
                    <button
                        type="button"
                        onClick={slidePrev}
                        aria-label="Previous feature"
                        className="group absolute top-1/3 -left-2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300/80 bg-white text-stone-800 shadow-xl transition-all hover:scale-110 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:-left-5 sm:size-13"
                    >
                        <ChevronLeft className="size-6 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <button
                        type="button"
                        onClick={slideNext}
                        aria-label="Next feature"
                        className="group absolute top-1/3 -right-2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300/80 bg-white text-stone-800 shadow-xl transition-all hover:scale-110 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:-right-5 sm:size-13"
                    >
                        <ChevronRight className="size-6 transition-transform group-hover:translate-x-0.5" />
                    </button>

                    {/* Touch & Mouse Drag Track */}
                    <div
                        className="cursor-grab touch-pan-y overflow-hidden py-4 active:cursor-grabbing"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        <div
                            className={`flex ${
                                isTransitioning && !isDragging
                                    ? 'transition-transform duration-500 ease-out'
                                    : ''
                            }`}
                            onTransitionEnd={handleTransitionEnd}
                            style={{
                                transform: `translateX(calc(-${
                                    currentIndex * (100 / visibleCount)
                                }% + ${dragDeltaX}px))`,
                            }}
                        >
                            {EXTENDED_USPS.map((item, index) => {
                                const realIndex = index % TOTAL_USPS;

                                return (
                                    <div
                                        key={`${item.title}-${index}`}
                                        className="flex shrink-0 flex-col items-center px-3 text-center"
                                        style={{
                                            width: `${100 / visibleCount}%`,
                                        }}
                                    >
                                        <div className="group relative">
                                            {/* Outer Card Ambient Glow */}
                                            <div
                                                aria-hidden
                                                className="pointer-events-none absolute -inset-4 hidden rounded-[2rem] bg-gradient-to-br from-amber-400/30 via-yellow-300/15 to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100 md:block"
                                            />

                                            {/* Square Card Image Frame (matches the 1:1 source images) */}
                                            <div className="relative flex aspect-square size-56 items-center justify-center overflow-hidden rounded-2xl border-4 border-amber-300 bg-stone-900 shadow-xl shadow-amber-900/10 transition-transform duration-300 group-hover:scale-105 sm:size-64 md:size-72">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="size-full rounded-xl object-cover"
                                                />
                                            </div>

                                            {/* Number Badge */}
                                            <span className="absolute -right-2 -bottom-2 flex size-10 items-center justify-center rounded-full border-3 border-amber-50 bg-stone-950 font-bengali text-sm font-bold text-amber-300 shadow-md sm:size-12 sm:text-base">
                                                {bnDigits[realIndex]}
                                            </span>
                                        </div>

                                        <h3 className="mt-6 font-bengali text-lg font-bold text-stone-900 sm:text-xl">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 max-w-xs font-bengali text-sm leading-relaxed text-stone-600">
                                            {item.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Issue 3 Fix: Exactly 6 Indicator Dots matching card count */}
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {usps.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDotClick(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    index === activeDotIndex
                                        ? 'w-8 bg-amber-500 shadow-md shadow-amber-500/40'
                                        : 'w-2.5 bg-amber-200 hover:bg-amber-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
