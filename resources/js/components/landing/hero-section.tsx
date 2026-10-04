import { ChevronLeft, ChevronRight, Sparkles, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import Magnetic from './motion/magnetic';
import OrderButton from './order-button';
import PriceReveal from './motion/price-reveal';

interface HeroSlide {
    id: number;
    imageWebp: string;
    imageJpeg: string;
    alt: string;
    badge: string;
    tagline: string;
    positionClass: string;
}

const heroSlides: HeroSlide[] = [
    {
        id: 1,
        imageWebp: '/images/hero/IMG_3612.webp',
        imageJpeg: '/images/hero/IMG_3612.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ১',
        badge: '১০০% অর্গানিক · ৯টি ভেষজ উপাদান',
        tagline: 'হাঁটু, কোমর ও ঘাড় ব্যথায় দ্রুত আরামদায়ক উপশম',
        positionClass: 'bottom-10 right-16 sm:bottom-14 sm:right-24 lg:right-32',
    },
    {
        id: 2,
        imageWebp: '/images/hero/IMG_3613.webp',
        imageJpeg: '/images/hero/IMG_3613.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ২',
        badge: 'প্রিমিয়াম ভেষজ ফর্মুলা',
        tagline: 'মহাঔষধী ভেষজের বিশেষ গুণসম্পন্ন ম্যাসাজ তেল',
        positionClass: 'top-16 sm:top-20 lg:top-24 right-14 sm:right-24 lg:right-32',
    },
    {
        id: 3,
        imageWebp: '/images/hero/IMG_3614.webp',
        imageJpeg: '/images/hero/IMG_3614.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ৩',
        badge: 'সারা বাংলাদেশে হোম ডেলিভারি',
        tagline: 'ঘরে বসেই অর্ডার করুন, হাতে পেয়ে মূল্য পরিশোধ করুন',
        positionClass: 'bottom-10 right-16 sm:bottom-16 sm:right-24 lg:right-32',
    },
    {
        id: 4,
        imageWebp: '/images/hero/IMG_3615.webp',
        imageJpeg: '/images/hero/IMG_3615.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ৪',
        badge: '৩ দিনের মানি-ব্যাক গ্যারান্টি',
        tagline: '১০০% ঝুঁকিমুক্ত কেনাকাটার নিশ্চয়তা',
        positionClass: 'bottom-12 right-16 sm:bottom-16 sm:right-24 lg:right-32',
    },
    {
        id: 5,
        imageWebp: '/images/hero/IMG_3616.webp',
        imageJpeg: '/images/hero/IMG_3616.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ৫',
        badge: '৫০০০+ সন্তুষ্ট গ্রাহকের ভরসা',
        tagline: 'নিয়মিত ব্যবহারে জীবনের স্বাভাবিক গতি ফিরে পান',
        positionClass: 'bottom-10 right-16 sm:bottom-14 sm:right-24 lg:right-32',
    },
];

const BENGALI_NUMERALS = ['০১', '০২', '০৩', '০৪', '০৫'];
const AUTO_PLAY_DURATION = 7000;

export default function HeroSection({
    regularPrice,
    salePrice,
}: {
    regularPrice: string;
    salePrice: string | null;
}) {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isPaused, setIsPaused] = useState(false);

    const activeIndex = ((page % heroSlides.length) + heroSlides.length) % heroSlides.length;
    const currentSlide = heroSlides[activeIndex];

    const paginate = useCallback((newDirection: number) => {
        setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            paginate(1);
        }, AUTO_PLAY_DURATION);
        return () => clearInterval(timer);
    }, [isPaused, paginate]);

    // Luxurious smooth slide transition variants
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '4%' : '-4%',
            opacity: 0,
            scale: 1.02,
            filter: 'blur(4px)',
        }),
        center: {
            x: '0%',
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            transition: {
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1],
            },
        },
        exit: (dir: number) => ({
            x: dir < 0 ? '4%' : '-4%',
            opacity: 0,
            scale: 0.98,
            filter: 'blur(4px)',
            transition: {
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
            },
        }),
    };

    return (
        <section
            id="top"
            aria-label="Hero Wallpaper Slider"
            className="relative w-full min-h-[70vh] sm:min-h-[85vh] lg:min-h-screen overflow-hidden bg-stone-950 select-none flex flex-col justify-between"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Ambient Lighting */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-amber-500/15 blur-[160px] z-10"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(120,72,0,0.15)_100%)] z-10"
            />

            {/* Auto-play Top Progress Line */}
            <div className="absolute top-0 inset-x-0 z-40 h-1 bg-stone-900/60 overflow-hidden">
                <motion.div
                    key={page}
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '100%' : '100%' }}
                    transition={{
                        duration: isPaused ? 0 : AUTO_PLAY_DURATION / 1000,
                        ease: 'linear',
                    }}
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-md shadow-amber-400/50"
                />
            </div>

            {/* Full Screen Viewport Slider Container */}
            <div className="relative w-full h-[70vh] sm:h-[85vh] lg:h-screen overflow-hidden">
                <AnimatePresence initial={false} custom={direction} mode="sync">
                    <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 size-full"
                    >
                        {/* Subtle Ken Burns Pan/Scale */}
                        <motion.div
                            initial={{ scale: 1.0 }}
                            animate={{ scale: 1.04 }}
                            transition={{
                                duration: 8,
                                ease: 'linear',
                            }}
                            className="relative size-full flex items-center justify-center bg-stone-950"
                        >
                            <picture className="size-full">
                                <source
                                    srcSet={currentSlide.imageWebp}
                                    type="image/webp"
                                />
                                <img
                                    src={currentSlide.imageJpeg}
                                    alt={currentSlide.alt}
                                    className="size-full object-cover object-center"
                                />
                            </picture>
                        </motion.div>

                        {/* Soft Vignette Overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/40" />
                    </motion.div>
                </AnimatePresence>

                {/* Top-Left Counter Badge */}
                <div className="absolute top-20 left-4 sm:top-24 sm:left-8 z-30 flex items-center gap-2 rounded-full border border-amber-400/30 bg-stone-950/80 px-4 py-1.5 backdrop-blur-md shadow-lg">
                    <span className="font-bengali text-sm font-bold text-amber-400">
                        {BENGALI_NUMERALS[activeIndex]}
                    </span>
                    <span className="text-stone-600 text-xs">/</span>
                    <span className="font-bengali text-xs sm:text-sm text-stone-400">
                        ০৫
                    </span>
                </div>

                {/* Left & Right Slider Arrow Buttons */}
                <button
                    type="button"
                    onClick={() => paginate(-1)}
                    aria-label="Previous slide"
                    className="group absolute left-4 sm:left-8 top-1/2 z-30 -translate-y-1/2 flex size-11 sm:size-14 items-center justify-center rounded-full border border-amber-400/30 bg-stone-950/70 text-amber-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                    <ChevronLeft className="size-6 sm:size-8 transition-transform group-hover:-translate-x-0.5" />
                </button>

                <button
                    type="button"
                    onClick={() => paginate(1)}
                    aria-label="Next slide"
                    className="group absolute right-4 sm:right-8 top-1/2 z-30 -translate-y-1/2 flex size-11 sm:size-14 items-center justify-center rounded-full border border-amber-400/30 bg-stone-950/70 text-amber-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                    <ChevronRight className="size-6 sm:size-8 transition-transform group-hover:translate-x-0.5" />
                </button>

                {/* Un-boxed Space-Efficient Floating CTA & Pricing Overlay */}
                <div className={`absolute z-30 max-w-[calc(100vw-4.5rem)] sm:max-w-sm lg:max-w-md ${currentSlide.positionClass}`}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide.id}
                            initial={{ opacity: 0, y: 12, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.96 }}
                            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-start gap-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]"
                        >
                            {/* Sleek Top Badges Row */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-stone-950/85 px-3 py-1 font-bengali text-[11px] sm:text-xs font-semibold text-amber-300 backdrop-blur-md shadow-md">
                                    <Sparkles className="size-3 text-amber-400" />
                                    {currentSlide.badge}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/85 px-3 py-1 font-bengali text-[11px] sm:text-xs font-semibold text-emerald-300 backdrop-blur-md shadow-md">
                                    <span className="relative flex size-2">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                    </span>
                                    <Truck className="size-3.5 text-emerald-400" />
                                    ক্যাশ অন ডেলিভারি
                                </span>
                            </div>

                            {/* Clean Price Line */}
                            <div className="flex items-baseline gap-3 font-bengali drop-shadow-lg">
                                {salePrice && (
                                    <span className="text-base sm:text-xl text-stone-300 line-through opacity-85">
                                        ৳{regularPrice}
                                    </span>
                                )}
                                <span className="text-3xl sm:text-5xl font-black text-amber-400 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                                    <PriceReveal
                                        prefix="৳"
                                        from={Number(regularPrice)}
                                        to={Number(salePrice ?? regularPrice)}
                                    />
                                </span>
                                <span className="text-xs text-stone-300 font-medium">মাত্র</span>
                            </div>

                            <p className="font-bengali text-xs sm:text-sm font-medium text-neutral-100 max-w-xs sm:max-w-sm drop-shadow-md leading-snug">
                                {currentSlide.tagline}
                            </p>

                            <div className="mt-1">
                                <Magnetic>
                                    <OrderButton
                                        href="#order"
                                        size="sm"
                                        className="sm:px-8 sm:py-3.5 sm:text-lg shadow-lg shadow-amber-500/20"
                                    >
                                        এখনই অর্ডার করুন
                                    </OrderButton>
                                </Magnetic>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Bottom Navigation Dots */}
                <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center items-center gap-2.5">
                    {heroSlides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setPage([index, index > activeIndex ? 1 : -1])}
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                index === activeIndex
                                    ? 'w-9 bg-amber-400 shadow-lg shadow-amber-400/50'
                                    : 'w-2.5 bg-stone-700/80 hover:bg-stone-500 backdrop-blur-sm'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
