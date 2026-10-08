import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import TapHint from './motion/tap-hint';

interface HeroSlide {
    id: number;
    // 2560x800 — desktop (1024px+).
    imageDesktop: string;
    // 1600x1200 (4:3 box, object-cover cropped) — tablet (425–1023px).
    imageTab: string;
    // 1920x1080 (16:9 box, object-cover cropped) — phones (<425px).
    imageMobile: string;
    alt: string;
}

const heroSlides: HeroSlide[] = [
    {
        id: 1,
        imageDesktop: '/images/hero/IMG_3616_desktop.webp',
        imageTab: '/images/hero/001_tab.webp',
        imageMobile: '/images/hero/001_mobile.webp',
        alt: 'বয়স বাড়লেও গতি রবে — আবাবিল অর্গানিক পেইন রিলিফ অয়েল',
    },
    {
        id: 2,
        imageDesktop: '/images/hero/IMG_3614_desktop.webp',
        imageTab: '/images/hero/002_tab.webp',
        imageMobile: '/images/hero/002_mobile.webp',
        alt: 'সচল পায়ে এগিয়ে চলুন — আবাবিল অর্গানিক পেইন রিলিফ অয়েল',
    },
    {
        id: 3,
        imageDesktop: '/images/hero/IMG_3615_desktop.webp',
        imageTab: '/images/hero/003_tab.webp',
        imageMobile: '/images/hero/003_mobile.webp',
        alt: 'শতবর্ষের ভেষজ রত্ন — আবাবিলের ব্যথামুক্তির যত্ন',
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

    // Luxurious smooth slide transition variants. Deliberately transform +
    // opacity only (no `filter: blur()`) — animating blur repaints the full
    // slide every frame, which is expensive on low-end mobile GPUs and this
    // transition plays automatically every ~7s for as long as the hero is
    // visible.
    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? '4%' : '-4%',
            opacity: 0,
            scale: 1.02,
        }),
        center: {
            x: '0%',
            opacity: 1,
            scale: 1,
            transition: {
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1] as const,
            },
        },
        exit: (dir: number) => ({
            x: dir < 0 ? '4%' : '-4%',
            opacity: 0,
            scale: 0.98,
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
            className="relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden bg-stone-950 select-none min-[425px]:aspect-[16/9] lg:aspect-[2560/800]"
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

            {/* Slider Container — a taller 4:3 crop on mobile (<425px), a
                16:9 crop on tablet (425–1023px), and the wide 2560:800
                banner ratio on desktop (1024px+) */}
            <div className="relative aspect-[4/3] w-full overflow-hidden min-[425px]:aspect-[16/9] lg:aspect-[2560/800]">
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
                            <a
                                href="#checkout"
                                aria-label="অর্ডার করতে ক্লিক করুন"
                                className="relative block size-full cursor-pointer"
                            >
                                <picture className="size-full">
                                    <source
                                        media="(max-width: 424px)"
                                        srcSet={currentSlide.imageMobile}
                                        type="image/webp"
                                    />
                                    <source
                                        media="(max-width: 1023px)"
                                        srcSet={currentSlide.imageTab}
                                        type="image/webp"
                                    />
                                    <img
                                        src={currentSlide.imageDesktop}
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
                                <TapHint />
                            </a>
                        </motion.div>

                        {/* Soft Vignette Overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/40" />
                    </motion.div>
                </AnimatePresence>

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
