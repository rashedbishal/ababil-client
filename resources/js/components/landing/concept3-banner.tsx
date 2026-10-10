import { useEffect, useRef, useState } from 'react';

// Same photography as the live page's HeroSection (public/images/hero/) -
// concept 3 duplicates the slide list rather than importing it, since its
// banner is a different, click-to-order component (no text overlay, no
// arrow controls), and HeroSection itself must stay untouched.
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
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % slides.length);
        }, AUTO_PLAY_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return (
        <section className="border-b border-amber-200 bg-amber-50">
            <div className="relative mx-auto aspect-[16/5] w-full max-w-[1920px] overflow-hidden sm:aspect-[3.2/1]">
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
            </div>

            <div className="flex items-center justify-center gap-3 py-4">
                {slides.map((slide, i) => (
                    <button
                        key={slide.id}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`ব্যানার ${i + 1}`}
                        aria-pressed={i === index}
                        className={`size-2.5 rounded-full transition-all ${
                            i === index
                                ? 'bg-stone-900 ring-4 ring-amber-200'
                                : 'bg-amber-200'
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
