import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

interface HeroSlide {
    id: number;
    imageWebp: string;
    imageWebpMobile: string;
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
        imageWebpMobile: '/images/hero/IMG_3612_mobile.webp',
        imageJpeg: '/images/hero/IMG_3612.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ১',
        badge: '১০০% অর্গানিক · বহু ভেষজ উপাদান',
        tagline: 'হাঁটু, কোমর ও ঘাড় ব্যথায় দ্রুত আরামদায়ক উপশম',
        positionClass: 'bottom-8 right-6 sm:bottom-14 sm:right-24 lg:right-32',
    },
    {
        id: 2,
        imageWebp: '/images/hero/IMG_3613.webp',
        imageWebpMobile: '/images/hero/IMG_3613_mobile.webp',
        imageJpeg: '/images/hero/IMG_3613.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ২',
        badge: 'প্রিমিয়াম ভেষজ ফর্মুলা',
        tagline: 'মহাঔষধী ভেষজের বিশেষ গুণসম্পন্ন ম্যাসাজ তেল',
        positionClass:
            'top-20 sm:top-24 lg:top-28 bottom-auto right-6 sm:right-24 lg:right-32',
    },
    {
        id: 3,
        imageWebp: '/images/hero/IMG_3614.webp',
        imageWebpMobile: '/images/hero/IMG_3614_mobile.webp',
        imageJpeg: '/images/hero/IMG_3614.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ৩',
        badge: 'সারা বাংলাদেশে হোম ডেলিভারি',
        tagline: 'ঘরে বসেই অর্ডার করুন, হাতে পেয়ে মূল্য পরিশোধ করুন',
        positionClass: 'bottom-8 right-6 sm:bottom-16 sm:right-24 lg:right-32',
    },
    {
        id: 4,
        imageWebp: '/images/hero/IMG_3615.webp',
        imageWebpMobile: '/images/hero/IMG_3615_mobile.webp',
        imageJpeg: '/images/hero/IMG_3615.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ৪',
        badge: '৩ দিনের মানি-ব্যাক গ্যারান্টি',
        tagline: '১০০% ঝুঁকিমুক্ত কেনাকাটার নিশ্চয়তা',
        positionClass: 'bottom-8 right-6 sm:bottom-16 sm:right-24 lg:right-32',
    },
    {
        id: 5,
        imageWebp: '/images/hero/IMG_3616.webp',
        imageWebpMobile: '/images/hero/IMG_3616_mobile.webp',
        imageJpeg: '/images/hero/IMG_3616.JPEG',
        alt: 'আবাবিল অর্গানিক পেইন রিলিফ অয়েল ব্যানার ৫',
        badge: '৫০০০+ সন্তুষ্ট গ্রাহকের ভরসা',
        tagline: 'নিয়মিত ব্যবহারে জীবনের স্বাভাবিক গতি ফিরে পান',
        positionClass: 'bottom-8 right-6 sm:bottom-14 sm:right-24 lg:right-32',
    },
];

const AUTO_PLAY_DURATION = 7000;

export default function HeroSection() {
    const [[page, direction], setPage] = useState([0, 0]);
    const [isPaused, setIsPaused] = useState(false);

    const activeIndex =
        ((page % heroSlides.length) + heroSlides.length) % heroSlides.length;
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
                ease: [0.16, 1, 0.3, 1] as const,
            },
        },
        exit: (dir: number) => ({
            x: dir < 0 ? '4%' : '-4%',
            opacity: 0,
            scale: 0.98,
            filter: 'blur(4px)',
            transition: {
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1] as const,
            },
        }),
    };

    return (
        <section
            id="top"
            aria-label="Hero Wallpaper Slider"
            className="relative flex h-[calc(100svh-4.5rem)] w-full flex-col justify-between overflow-hidden bg-stone-950 select-none lg:aspect-[2560/800] lg:h-auto"
        >
            {/* Ambient Lighting */}
            <div
                aria-hidden
                className="pointer-events-none absolute -top-40 left-1/2 z-10 hidden size-[700px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[160px] md:block"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(120,72,0,0.15)_100%)]"
            />

            {/* Viewport Slider Container for Mobile/Tab & Aspect Ratio for Desktop */}
            <div className="relative h-[calc(100svh-4.5rem)] w-full overflow-hidden lg:aspect-[2560/800] lg:h-full">
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
                            className="relative flex size-full items-center justify-center bg-stone-950"
                        >
                            <picture className="size-full">
                                <source
                                    media="(max-width: 767px)"
                                    srcSet={currentSlide.imageWebpMobile}
                                    type="image/webp"
                                />
                                <source
                                    srcSet={currentSlide.imageWebp}
                                    type="image/webp"
                                />
                                <img
                                    src={currentSlide.imageJpeg}
                                    alt={currentSlide.alt}
                                    loading={
                                        activeIndex === 0 ? 'eager' : 'lazy'
                                    }
                                    decoding="async"
                                    fetchPriority={
                                        activeIndex === 0 ? 'high' : 'auto'
                                    }
                                    className="size-full object-cover object-center"
                                />
                            </picture>
                        </motion.div>

                        {/* Soft Vignette Overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/40" />
                    </motion.div>
                </AnimatePresence>

                <div
                    className={`absolute z-30 max-w-[min(16rem,calc(100%-1.5rem))] rounded-xl border border-amber-300/30 bg-stone-950/75 px-3 py-2.5 shadow-xl shadow-black/25 backdrop-blur-md ${currentSlide.positionClass}`}
                >
                    <span className="inline-block rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 font-bengali text-[8px] font-semibold tracking-[0.12em] text-amber-300 uppercase sm:text-[9px]">
                        {currentSlide.badge}
                    </span>
                    <p className="mt-1 font-bengali text-[11px] leading-snug font-medium text-white sm:text-xs">
                        {currentSlide.tagline}
                    </p>
                </div>

                {/* Slider Arrow Buttons (grouped, bottom-left corner) */}
                <div
                    className="absolute bottom-4 left-4 z-30 flex items-center gap-2 sm:bottom-6 sm:left-6"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <button
                        type="button"
                        onClick={() => paginate(-1)}
                        aria-label="Previous slide"
                        className="group flex size-9 items-center justify-center rounded-full border border-amber-400/30 bg-stone-950/70 text-amber-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:size-11"
                    >
                        <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5 sm:size-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => paginate(1)}
                        aria-label="Next slide"
                        className="group flex size-9 items-center justify-center rounded-full border border-amber-400/30 bg-stone-950/70 text-amber-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:size-11"
                    >
                        <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5 sm:size-6" />
                    </button>
                </div>

                {/* Bottom Navigation Dots */}
                <div
                    className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-2.5"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {heroSlides.map((slide, index) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() =>
                                setPage([index, index > activeIndex ? 1 : -1])
                            }
                            aria-label={`Go to slide ${index + 1}`}
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                index === activeIndex
                                    ? 'w-9 bg-amber-400 shadow-lg shadow-amber-400/50'
                                    : 'w-2.5 bg-stone-700/80 backdrop-blur-sm hover:bg-stone-500'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
