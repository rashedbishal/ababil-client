import { useCallback, useEffect, useRef, useState } from 'react';

// Same photography as the live page's HeroSection (public/images/hero/) -
// concept 3 duplicates the slide list rather than importing it, since its
// banner is a different, click-to-order component (no text overlay), and
// HeroSection itself must stay untouched.
//
// slides[0] is this page's LCP element, and its markup/URLs are duplicated
// as a static placeholder in resources/views/app.blade.php (no SSR means
// the browser can't discover this component's own markup up front) - keep
// that in sync if slide 1 ever changes.
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

const AUTO_PLAY_MS = 7000;
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
    const dragXRef = useRef(0);
    const draggingRef = useRef(false);
    // Set when a drag turns into a swipe, so the click the browser fires
    // on release doesn't also trigger the slide's order action.
    const didSwipeRef = useRef(false);

    // resources/views/app.blade.php renders a static copy of this banner's
    // first slide so it paints before React does (see #lcp-placeholder
    // there). It must stay on screen until *this* component's own matching
    // image has actually loaded - not merely once React has mounted -
    // otherwise the real slide could pop in a beat later than its static
    // stand-in and flash/shift. `loadedPositions` seeds position 1 (this
    // slide) eagerly, so its <img> below is present from this component's
    // very first render.
    const removeLcpPlaceholder = useCallback(() => {
        document.getElementById('lcp-placeholder')?.remove();
    }, []);
    // `complete`/`load` alone can be true for a broken image (naturalWidth
    // stays 0) and don't guarantee the bitmap is actually decoded and
    // ready to paint - `decode()` does, so it's used here to gate the
    // swap wherever the browser supports it. Its rejection is handled via
    // the second `then()` argument (not a separate `.catch()`, and never
    // left unhandled) - a decode failure still removes the placeholder,
    // since the real <img> is already in the DOM by then and showing
    // nothing (or a broken-image icon) is no worse than a stale
    // placeholder stuck on screen forever.
    const revealRealSlide = useCallback(
        (img: HTMLImageElement) => {
            if (typeof img.decode === 'function') {
                img.decode().then(removeLcpPlaceholder, removeLcpPlaceholder);
            } else {
                removeLcpPlaceholder();
            }
        },
        [removeLcpPlaceholder],
    );
    // Covers the (likely, since the image is already server-preloaded by
    // the time this mounts) case where the image is already loaded from
    // cache by the time this ref runs, so `onLoad` below would never fire.
    const lcpImageRef = useCallback(
        (node: HTMLImageElement | null) => {
            if (node?.complete && node.naturalWidth > 0) {
                revealRealSlide(node);
            }
        },
        [revealRealSlide],
    );
    const handleLcpImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            revealRealSlide(e.currentTarget);
        },
        [revealRealSlide],
    );

    // `track` has SLIDE_COUNT + 2 full-bleed photos (two clones included),
    // and `position` indexes it 1:1. Requesting all of them up front
    // (as this component used to) means 7 concurrent image downloads
    // competing with the one the user can actually see, which is this
    // page's LCP element on mobile - so only `position` itself, plus its
    // immediate neighbours, are ever given a real `src`. Neighbours are
    // added with a short delay so they don't compete with the initial
    // slide's own fetch, but are ready well before AUTO_PLAY_MS advances
    // the carousel or a swipe reaches them.
    const [loadedPositions, setLoadedPositions] = useState<Set<number>>(
        () => new Set([1]),
    );

    useEffect(() => {
        setLoadedPositions((prev) => {
            if (prev.has(position)) return prev;
            const next = new Set(prev);
            next.add(position);
            return next;
        });
    }, [position]);

    useEffect(() => {
        const timer = setTimeout(
            () => {
                setLoadedPositions((prev) => {
                    const a = Math.max(0, position - 1);
                    const b = Math.min(SLIDE_COUNT + 1, position + 1);
                    if (prev.has(a) && prev.has(b)) return prev;
                    const next = new Set(prev);
                    next.add(a);
                    next.add(b);
                    return next;
                });
            },
            position === 1 ? 1500 : 300,
        );
        return () => clearTimeout(timer);
    }, [position]);

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
        setPosition((p) =>
            p === 0 ? SLIDE_COUNT : p === SLIDE_COUNT + 1 ? 1 : p,
        );
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

        // Do not setState here. Facebook's in-app browser drops the
        // subsequent click if React re-renders on pointerdown, so a tap
        // never opens the order drawer. Swipe state is applied only after
        // the finger has actually moved (handlePointerMove).
        startXRef.current = e.clientX;
        dragXRef.current = 0;
        draggingRef.current = false;
        didSwipeRef.current = false;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (startXRef.current === null) return;
        const dx = e.clientX - startXRef.current;
        dragXRef.current = dx;

        if (!draggingRef.current) {
            if (Math.abs(dx) < 8) return;
            draggingRef.current = true;
            didSwipeRef.current = true;
            // Grabbing the track mid-slide onto a clone: swap to the
            // identical real slide first, so the drag can continue in
            // either direction.
            if (isOnClone) jumpOffClone();
            setIsDragging(true);
        }

        setDragX(dx);
    };

    const endDrag = (commit: boolean) => {
        if (startXRef.current === null) return;
        const dx = dragXRef.current;
        const wasDragging = draggingRef.current;
        startXRef.current = null;
        dragXRef.current = 0;
        draggingRef.current = false;

        // A tap never entered drag state — leave React state alone so the
        // click can open the order drawer.
        if (!wasDragging) return;

        setIsDragging(false);
        setDragX(0);

        if (!commit || Math.abs(dx) < SWIPE_THRESHOLD) {
            // Snap back to the current slide.
            setIsAnimating(true);
            return;
        }

        didSwipeRef.current = true;
        if (dx < 0) {
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
                onPointerLeave={() => {
                    if (draggingRef.current) endDrag(true);
                }}
                onPointerCancel={() => endDrag(false)}
            >
                <div
                    className="flex size-full"
                    style={{
                        transform: `translateX(calc(${-position * 100}% + ${dragX}px))`,
                        // Must be explicit: transition-property defaults to
                        // `all`, so a bare duration would animate the silent
                        // clone-to-real jump back across every slide.
                        transition:
                            isAnimating && !isDragging
                                ? `transform ${SLIDE_MS}ms ease-out`
                                : 'none',
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
                            {loadedPositions.has(i) ? (
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
                                        ref={i === 1 ? lcpImageRef : undefined}
                                        src={slide.desktop}
                                        alt={slide.isClone ? '' : slide.alt}
                                        // Off-screen slides of a translated
                                        // track may never count as "near the
                                        // viewport", so lazy loading could
                                        // leave them blank as they slide in -
                                        // `loadedPositions` is what gates the
                                        // request instead, so this can stay
                                        // eager once a slide is in that set.
                                        loading="eager"
                                        fetchPriority={
                                            i === 1 ? 'high' : 'auto'
                                        }
                                        onLoad={
                                            i === 1
                                                ? handleLcpImageLoad
                                                : undefined
                                        }
                                        draggable={false}
                                        className="size-full object-cover"
                                    />
                                </picture>
                            ) : (
                                <div
                                    aria-hidden
                                    className="size-full bg-amber-100"
                                />
                            )}
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
