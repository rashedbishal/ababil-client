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

const SLIDE_COUNT = slides.length;

// The track is [last clone, ...slides, first clone], so sliding past either
// end lands on a clone that looks identical to the real slide on the other
// side; once that slide-in finishes, the track silently jumps to the real one.
const track = [
    { ...slides[SLIDE_COUNT - 1], key: 'clone-last', isClone: true },
    ...slides.map((slide) => ({ ...slide, key: slide.id, isClone: false })),
    { ...slides[0], key: 'clone-first', isClone: true },
];

const AUTO_PLAY_MS = 4000;
const SLIDE_MS = 500;

// Minimum horizontal travel (px) before a drag counts as a swipe rather
// than a tap/click on the slide.
const SWIPE_THRESHOLD = 50;

/** Full-bleed campaign banner - every slide is a single click-to-order button. */
export default function Concept3Banner({
    onOrderClick,
}: {
    onOrderClick: () => void;
}) {
    // Position in `track`: 1..SLIDE_COUNT are real slides, 0 and
    // SLIDE_COUNT + 1 are the clones.
    const [position, setPosition] = useState(1);
    const [isAnimating, setIsAnimating] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragX, setDragX] = useState(0);
    const startXRef = useRef<number | null>(null);
    // Set when a drag turns into a swipe, so the click the browser fires
    // on release doesn't also trigger the slide's order action.
    const didSwipeRef = useRef(false);

    const activeIndex = (position - 1 + SLIDE_COUNT) % SLIDE_COUNT;
    const isOnClone = position === 0 || position === SLIDE_COUNT + 1;

    // Keyed on the real slide (not `position`) so the clone-to-real jump
    // doesn't restart the timer, but any user-driven change does.
    useEffect(() => {
        if (isDragging) return;
        const timer = setTimeout(() => {
            setIsAnimating(true);
            setPosition((p) => Math.min(p + 1, SLIDE_COUNT + 1));
        }, AUTO_PLAY_MS);

        return () => clearTimeout(timer);
    }, [isDragging, activeIndex]);

    const jumpOffClone = () => {
        setIsAnimating(false);
        // Without forcing a paint between disabling the transition and
        // changing position, some browsers still animate the rebase -
        // sliding backward through every slide instead of jumping
        // instantly. A double rAF guarantees the no-transition style is
        // committed first.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setPosition((p) =>
                    p === 0 ? SLIDE_COUNT : p === SLIDE_COUNT + 1 ? 1 : p,
                );
            });
        });
    };

    // Fallback in case `transitionend` never fires (e.g. the tab was hidden
    // mid-slide), so the track can't get stuck on a clone.
    useEffect(() => {
        if (!isOnClone) return;
        const timer = setTimeout(jumpOffClone, SLIDE_MS + 100);

        return () => clearTimeout(timer);
    }, [isOnClone]);

    const goPrev = () => {
        setIsAnimating(true);
        setPosition((p) => Math.max(p - 1, 0));
    };
    const goNext = () => {
        setIsAnimating(true);
        setPosition((p) => Math.min(p + 1, SLIDE_COUNT + 1));
    };
    const goTo = (i: number) => {
        setIsAnimating(true);
        setPosition(i + 1);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        // The dots handle their own clicks.
        if ((e.target as HTMLElement).closest('[data-banner-control]')) return;

        // Grabbing the track mid-slide onto a clone: swap to the identical
        // real slide first, so the drag can continue in either direction.
        if (isOnClone) jumpOffClone();

        startXRef.current = e.clientX;
        didSwipeRef.current = false;
        setIsDragging(true);
        setDragX(0);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (startXRef.current === null) return;
        setDragX(e.clientX - startXRef.current);
    };

    const endDrag = (commit: boolean) => {
        if (startXRef.current === null) return;
        startXRef.current = null;
        setIsDragging(false);
        setDragX(0);

        if (!commit || Math.abs(dragX) < SWIPE_THRESHOLD) {
            // Snap back to the current slide.
            setIsAnimating(true);
            return;
        }

        didSwipeRef.current = true;
        if (dragX < 0) {
            goNext();
        } else {
            goPrev();
        }
    };

    const handleSlideClick = () => {
        if (didSwipeRef.current) {
            didSwipeRef.current = false;
            return;
        }
        onOrderClick();
    };

    return (
        <section className="border-b border-amber-200 bg-amber-50">
            {/* touch-pan-y: the browser keeps vertical page scrolling, and
                horizontal finger drags come to the pointer handlers below */}
            <div
                className={`relative mx-auto aspect-[4/3] w-full max-w-[1920px] touch-pan-y overflow-hidden select-none sm:aspect-[16/9] lg:aspect-[2560/800] ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={() => endDrag(true)}
                onPointerLeave={() => endDrag(true)}
                onPointerCancel={() => endDrag(false)}
            >
                <div
                    className={`flex size-full ${
                        isAnimating && !isDragging
                            ? 'transition-transform ease-out'
                            : ''
                    }`}
                    style={{
                        transform: `translateX(calc(${-position * 100}% + ${dragX}px))`,
                        transitionDuration: `${SLIDE_MS}ms`,
                    }}
                    onTransitionEnd={(e) => {
                        if (e.target === e.currentTarget && isOnClone) {
                            jumpOffClone();
                        }
                    }}
                >
                    {track.map((slide, i) => (
                        <button
                            key={slide.key}
                            type="button"
                            onClick={handleSlideClick}
                            aria-label="আবাবিল অর্ডার করুন"
                            aria-hidden={slide.isClone || undefined}
                            tabIndex={i === position ? 0 : -1}
                            className="size-full shrink-0 cursor-[inherit]"
                        >
                            <picture>
                                <source
                                    media="(max-width: 639px)"
                                    srcSet={slide.mobile}
                                />
                                <source
                                    media="(max-width: 1023px)"
                                    srcSet={slide.tab}
                                />
                                <img
                                    src={slide.desktop}
                                    alt={slide.isClone ? '' : slide.alt}
                                    // Off-screen slides of a translated track
                                    // may never count as "near the viewport",
                                    // so lazy loading could leave them blank
                                    // as they slide in.
                                    loading="eager"
                                    fetchPriority={i === 1 ? 'high' : 'auto'}
                                    draggable={false}
                                    className="size-full object-cover"
                                />
                            </picture>
                        </button>
                    ))}
                </div>

                {/* Bottom Navigation Dots — overlaid on the banner, matching
                    the main HeroSection's layout */}
                <div
                    data-banner-control
                    className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-2.5"
                >
                    {slides.map((slide, i) => (
                        <button
                            key={slide.id}
                            type="button"
                            onClick={() => goTo(i)}
                            aria-label={`ব্যানার ${i + 1}`}
                            aria-pressed={i === activeIndex}
                            className={`pointer-events-auto h-2.5 rounded-full transition-all duration-500 ${
                                i === activeIndex
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
