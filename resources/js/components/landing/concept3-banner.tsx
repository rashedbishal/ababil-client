import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Same photography as the live page's HeroSection (public/images/hero/) -
// concept 3 duplicates the slide list rather than importing it, since its
// banner is a different, click-to-order component (no text overlay), and
// HeroSection itself must stay untouched.
const slides = [
    {
        id: 1,
        desktop: '/images/hero/IMG_3616_desktop.webp',
        tab: '/images/hero/001_tab.webp',
        mobile: '/images/hero/001_mobile.webp',
        alt: 'বয়স বাড়লেও গতি রবে — আবাবিল অয়েল',
    },
    {
        id: 2,
        desktop: '/images/hero/IMG_3614_desktop.webp',
        tab: '/images/hero/002_tab.webp',
        mobile: '/images/hero/002_mobile.webp',
        alt: 'সচল পায়ে এগিয়ে চলুন — আবাবিল অয়েল',
    },
    {
        id: 3,
        desktop: '/images/hero/IMG_3615_desktop.webp',
        tab: '/images/hero/003_tab.webp',
        mobile: '/images/hero/003_mobile.webp',
        alt: 'শতবর্ষের ভেষজ রত্ন — আবাবিল অয়েল',
    },
    {
        id: 4,
        desktop: '/images/hero/IMG_3612_desktop.webp',
        tab: '/images/hero/3612_tab.webp',
        mobile: '/images/hero/3612_mobile.webp',
        alt: 'স্বস্তিতে বাঁচুক শরীর-মন — আবাবিল অয়েল',
    },
    {
        id: 5,
        desktop: '/images/hero/IMG_3613_desktop.webp',
        tab: '/images/hero/3613_tab.webp',
        mobile: '/images/hero/3613_mobile.webp',
        alt: 'ঘুম হোক শান্তির — আবাবিল অয়েল',
    },
];

const AUTO_PLAY_MS = 4000;

/** Full-bleed campaign banner - every slide is a single click-to-order button. */
export default function Concept3Banner({
    onOrderClick,
}: {
    onOrderClick: () => void;
}) {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isPaused) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, AUTO_PLAY_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPaused]);

    const goPrev = () =>
        setIndex((i) => (i - 1 + slides.length) % slides.length);
    const goNext = () => setIndex((i) => (i + 1) % slides.length);

    return (
        <section className="border-b border-amber-200 bg-amber-50">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[1920px] overflow-hidden min-[425px]:aspect-[16/9] lg:aspect-[2560/800]">
                {slides.map((slide, i) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={onOrderClick}
                        aria-label="আবাবিল অর্ডার করুন"
                        className={`absolute inset-0 transition-opacity duration-700 ${
                            i === index
                                ? 'opacity-100'
                                : 'pointer-events-none opacity-0'
                        }`}
                    >
                        <picture>
                            <source
                                media="(max-width: 600px)"
                                srcSet={slide.mobile}
                            />
                            <source
                                media="(max-width: 1000px)"
                                srcSet={slide.tab}
                            />
                            <img
                                src={slide.desktop}
                                alt={slide.alt}
                                loading={i === 0 ? 'eager' : 'lazy'}
                                className="size-full object-cover"
                            />
                        </picture>
                    </button>
                ))}

                {/* Slider Arrow Buttons (grouped, bottom-left corner) —
                    matching the main HeroSection's layout */}
                <div
                    className="absolute bottom-4 left-4 z-30 flex items-center gap-2 sm:bottom-6 sm:left-6"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <button
                        type="button"
                        onClick={goPrev}
                        aria-label="Previous slide"
                        className="group flex size-9 items-center justify-center rounded-full border border-amber-400/30 bg-stone-950/70 text-amber-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:size-11"
                    >
                        <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-0.5 sm:size-6" />
                    </button>

                    <button
                        type="button"
                        onClick={goNext}
                        aria-label="Next slide"
                        className="group flex size-9 items-center justify-center rounded-full border border-amber-400/30 bg-stone-950/70 text-amber-400 shadow-2xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:size-11"
                    >
                        <ChevronRight className="size-5 transition-transform group-hover:translate-x-0.5 sm:size-6" />
                    </button>
                </div>

                {/* Bottom Navigation Dots — overlaid on the banner, matching
                    the main HeroSection's layout */}
                <div className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-2.5">
                    {slides.map((slide, i) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-label={`ব্যানার ${i + 1}`}
                            aria-pressed={i === index}
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                                i === index
                                    ? 'w-9 bg-stone-900 shadow-lg shadow-stone-900/40'
                                    : 'w-2.5 bg-amber-200/80 backdrop-blur-sm hover:bg-amber-300'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
