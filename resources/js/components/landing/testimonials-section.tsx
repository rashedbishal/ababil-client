import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from './motion/reveal';

interface VideoReview {
    id: number;
    video_id: string;
}

export default function TestimonialsSection({
    reviews,
}: {
    reviews: VideoReview[];
}) {
    const TOTAL_ORIGINAL = reviews.length;

    // 5-set extended array for 100% gapless infinite loop protection
    const EXTENDED_ITEMS = [
        ...reviews,
        ...reviews,
        ...reviews,
        ...reviews,
        ...reviews,
    ];
    // Start at middle set (index = TOTAL_ORIGINAL * 2)
    const [currentIndex, setCurrentIndex] = useState(TOTAL_ORIGINAL * 2);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [visibleCount, setVisibleCount] = useState(3);
    const [isDragging, setIsDragging] = useState(false);
    const [dragDeltaX, setDragDeltaX] = useState(0);
    const [activeVideos, setActiveVideos] = useState<Record<number, boolean>>(
        {},
    );

    const startXRef = useRef<number | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    // Responsive visible items count: Desktop = 3, Tablet = 2, Mobile = 1
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
        setIsTransitioning(true);
        setCurrentIndex((prev) => {
            if (prev >= TOTAL_ORIGINAL * 3) {
                return TOTAL_ORIGINAL * 2 + 1;
            }
            return prev + 1;
        });
    }, [TOTAL_ORIGINAL]);

    const slidePrev = useCallback(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => {
            if (prev < TOTAL_ORIGINAL) {
                return TOTAL_ORIGINAL * 2 - 1;
            }
            return prev - 1;
        });
    }, [TOTAL_ORIGINAL]);

    const resetLoopPosition = useCallback(
        (targetIndex: number) => {
            const realIndex =
                ((targetIndex % TOTAL_ORIGINAL) + TOTAL_ORIGINAL) %
                TOTAL_ORIGINAL;
            setIsTransitioning(false);
            setCurrentIndex(TOTAL_ORIGINAL * 2 + realIndex);
        },
        [TOTAL_ORIGINAL],
    );

    // Handle seamless infinite loop jump when transition ends
    const handleTransitionEnd = () => {
        if (
            currentIndex >= TOTAL_ORIGINAL * 3 ||
            currentIndex < TOTAL_ORIGINAL
        ) {
            resetLoopPosition(currentIndex);
        }
    };

    // Fallback timer in case transitionend event is dropped by browser
    useEffect(() => {
        if (
            currentIndex >= TOTAL_ORIGINAL * 3 ||
            currentIndex < TOTAL_ORIGINAL
        ) {
            const fallbackTimer = setTimeout(() => {
                resetLoopPosition(currentIndex);
            }, 550);
            return () => clearTimeout(fallbackTimer);
        }
    }, [currentIndex, resetLoopPosition, TOTAL_ORIGINAL]);

    // Pointer / Touch / Mouse Drag event handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        // Only trigger primary click/touch
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

        const threshold = 50; // min swipe distance in px
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
        // Calculate offset in current middle loop
        const currentMod = currentIndex % TOTAL_ORIGINAL;
        const diff = index - currentMod;
        setCurrentIndex((prev) => prev + diff);
    };

    // Calculate real active index for indicator dots
    const activeDotIndex =
        ((currentIndex % TOTAL_ORIGINAL) + TOTAL_ORIGINAL) % TOTAL_ORIGINAL;

    if (TOTAL_ORIGINAL === 0) {
        return null;
    }

    return (
        <section
            id="reviews"
            className="relative scroll-mt-24 overflow-hidden bg-stone-950 py-8 select-none sm:py-16"
        >
            {/* Background Glow Effects */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgb(251,191,36,0.12),transparent_50%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_100%,rgb(251,191,36,0.1),transparent_50%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
            />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
                {/* Header */}
                <Reveal className="text-center">
                    <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                        গ্রাহকদের ভিডিও অভিজ্ঞতা
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl font-bengali text-sm text-neutral-400 sm:text-base">
                        আমাদের আসল গ্রাহকদের ভিডিও রিভিউ সরাসরি দেখুন। ১০০% অরিজিনাল
                        অভিজ্ঞতা।
                    </p>
                </Reveal>

                {/* Slider Container with Prev / Next Buttons */}
                <div className="relative mt-12 sm:mt-16">
                    {/* Navigation Buttons */}
                    <button
                        type="button"
                        onClick={slidePrev}
                        aria-label="Previous video"
                        className="group absolute top-1/2 -left-2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400/30 bg-stone-900/80 text-amber-400 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:-left-5 sm:size-13"
                    >
                        <ChevronLeft className="size-6 transition-transform group-hover:-translate-x-0.5 sm:size-7" />
                    </button>

                    <button
                        type="button"
                        onClick={slideNext}
                        aria-label="Next video"
                        className="group absolute top-1/2 -right-2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400/30 bg-stone-900/80 text-amber-400 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:border-amber-400 hover:bg-amber-500 hover:text-stone-950 focus:ring-2 focus:ring-amber-400 focus:outline-none sm:-right-5 sm:size-13"
                    >
                        <ChevronRight className="size-6 transition-transform group-hover:translate-x-0.5 sm:size-7" />
                    </button>

                    {/* Carousel Track Wrapper */}
                    <div
                        ref={sliderRef}
                        className="cursor-grab touch-pan-y overflow-hidden rounded-3xl py-4 active:cursor-grabbing"
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
                            {EXTENDED_ITEMS.map((item, index) => {
                                // Embed URL with autoplay=1&mute=1 for automatic muted play
                                const embedUrl = `https://www.youtube.com/embed/${item.video_id}?autoplay=1&mute=1&enablejsapi=1&loop=1&playlist=${item.video_id}&controls=1&rel=0&modestbranding=1`;

                                return (
                                    <div
                                        key={`${item.id}-${index}`}
                                        className="shrink-0 px-3"
                                        style={{
                                            width: `${100 / visibleCount}%`,
                                        }}
                                    >
                                        {/* Reels-style Video Container (Aspect Ratio 9:16) */}
                                        <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-amber-500/20 bg-black shadow-inner">
                                            {Math.abs(index - currentIndex) <=
                                                visibleCount + 1 ||
                                            activeVideos[index] ? (
                                                <iframe
                                                    src={embedUrl}
                                                    title={`Customer video review ${index + 1}`}
                                                    loading="lazy"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    className={`h-full w-full rounded-2xl object-cover ${
                                                        isDragging
                                                            ? 'pointer-events-none'
                                                            : ''
                                                    }`}
                                                />
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveVideos(
                                                            (prev) => ({
                                                                ...prev,
                                                                [index]: true,
                                                            }),
                                                        )
                                                    }
                                                    aria-label={`Play customer video review ${index + 1}`}
                                                    className="relative flex size-full items-center justify-center bg-stone-900"
                                                >
                                                    <img
                                                        src={`https://img.youtube.com/vi/${item.video_id}/hqdefault.jpg`}
                                                        alt="Customer video review"
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="size-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                                                    />
                                                    <span className="absolute flex size-14 items-center justify-center rounded-full border border-amber-400/40 bg-stone-950/80 text-amber-400 shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110">
                                                        <Play className="size-6 fill-amber-400" />
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pagination / Indicator Dots */}
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDotClick(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    index === activeDotIndex
                                        ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/40'
                                        : 'w-2.5 bg-stone-700 hover:bg-stone-500'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
