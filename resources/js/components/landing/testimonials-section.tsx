import { ChevronLeft, ChevronRight, Play, Star, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Reveal from './motion/reveal';

interface VideoTestimonial {
    id: string;
    videoId: string;
    name: string;
    location: string;
    rating: number;
    title: string;
    ring: string;
}

const videoTestimonials: VideoTestimonial[] = [
    {
        id: '1',
        videoId: 'dQw4w9WgXcQ',
        name: 'রফিকুল ইসলাম',
        location: 'ঢাকা',
        rating: 5,
        title: 'হাঁটুর ব্যথায় ১ সপ্তাহেই দারুণ স্বস্তি পেয়েছেন',
        ring: 'from-amber-400 to-yellow-600',
    },
    {
        id: '2',
        videoId: 'L_LUpnjgPso',
        name: 'সাবিনা ইয়াসমিন',
        location: 'চট্টগ্রাম',
        rating: 5,
        title: 'দীর্ঘদিনের কোমর ব্যথায় উপশম পেয়েছেন',
        ring: 'from-yellow-400 to-amber-600',
    },
    {
        id: '3',
        videoId: 'tgbNymZ7vqY',
        name: 'আব্দুল করিম',
        location: 'সিলেট',
        rating: 5,
        title: 'ঘাড় ও কাঁধের ব্যথায় কার্যকরী অভিজ্ঞতা',
        ring: 'from-amber-400 to-amber-700',
    },
    {
        id: '4',
        videoId: '3JZ_D3ELwOQ',
        name: 'নুরুল হুদা',
        location: 'রাজশাহী',
        rating: 5,
        title: 'নিয়মিত ম্যাসাজে হাঁটুর চলাফেরা সহজ হয়েছে',
        ring: 'from-amber-300 to-yellow-500',
    },
    {
        id: '5',
        videoId: 'kJQP7kiw5Fk',
        name: 'মাহমুদা আক্তার',
        location: 'খুলনা',
        rating: 5,
        title: 'মেঝের কাজে পিঠের ব্যথায় দারুণ ফলাফল',
        ring: 'from-yellow-500 to-amber-600',
    },
    {
        id: '6',
        videoId: 'fJ9rUzIMcZQ',
        name: 'ফারুক হোসেন',
        location: 'বরিশাল',
        rating: 5,
        title: 'দ্রুত শোষণে কাপড়ে দাগ না লাগার অভিজ্ঞতা',
        ring: 'from-amber-500 to-amber-800',
    },
    {
        id: '7',
        videoId: '9bZkp7q19f0',
        name: 'শাহানা পারভীন',
        location: 'কুমিল্লা',
        rating: 5,
        title: 'পারিবারিকভাবে ব্যবহারের পর আমাদের মতামত',
        ring: 'from-yellow-400 to-amber-700',
    },
];

const TOTAL_ORIGINAL = videoTestimonials.length;
// We duplicate the items 3 times to allow infinite loop transitions seamlessly
const EXTENDED_ITEMS = [
    ...videoTestimonials,
    ...videoTestimonials,
    ...videoTestimonials,
];

export default function TestimonialsSection() {
    // Start at middle set (index = TOTAL_ORIGINAL = 7)
    const [currentIndex, setCurrentIndex] = useState(TOTAL_ORIGINAL);
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
        if (!isTransitioning) setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    }, [isTransitioning]);

    const slidePrev = useCallback(() => {
        if (!isTransitioning) setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    }, [isTransitioning]);

    // Handle seamless infinite loop jump when transition ends
    const handleTransitionEnd = () => {
        if (currentIndex >= TOTAL_ORIGINAL * 2) {
            setIsTransitioning(false);
            setCurrentIndex(currentIndex - TOTAL_ORIGINAL);
        } else if (currentIndex < TOTAL_ORIGINAL) {
            setIsTransitioning(false);
            setCurrentIndex(currentIndex + TOTAL_ORIGINAL);
        }
    };

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

    // Calculate real active index for indicator dots (0 to 6)
    const activeDotIndex =
        ((currentIndex % TOTAL_ORIGINAL) + TOTAL_ORIGINAL) % TOTAL_ORIGINAL;

    return (
        <section
            id="reviews"
            className="relative scroll-mt-24 overflow-hidden bg-stone-950 py-16 select-none sm:py-24"
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
                    <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-bengali text-xs font-semibold tracking-wide text-amber-400 backdrop-blur-md">
                        <Play className="size-3.5 fill-amber-400 text-amber-400" />
                        ৫০০০+ ভিডিও রিভিউ
                    </span>
                    <h2 className="mt-4 text-center font-bengali text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
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
                                const embedUrl = `https://www.youtube.com/embed/${item.videoId}?autoplay=1&mute=1&enablejsapi=1&loop=1&playlist=${item.videoId}&controls=1&rel=0&modestbranding=1`;

                                return (
                                    <div
                                        key={`${item.id}-${index}`}
                                        className="shrink-0 px-3"
                                        style={{
                                            width: `${100 / visibleCount}%`,
                                        }}
                                    >
                                        <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-400/20 bg-gradient-to-b from-stone-900/90 via-stone-900/60 to-stone-950/90 p-4 shadow-2xl shadow-black/70 backdrop-blur-md transition-transform duration-300 hover:border-amber-400/40">
                                            {/* Top Header Badge inside Card */}
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`flex size-8 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-stone-950 shadow-md ${item.ring}`}
                                                    >
                                                        {item.name.charAt(0)}
                                                    </span>
                                                    <div>
                                                        <p className="font-bengali text-sm font-semibold text-white">
                                                            {item.name}
                                                        </p>
                                                        <p className="font-bengali text-xs text-amber-400/80">
                                                            {item.location}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                                                    <VolumeX className="size-3" />
                                                    <span>Muted HD</span>
                                                </div>
                                            </div>

                                            {/* 1080x1080p Square Video Container (Aspect Ratio 1:1) */}
                                            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-amber-500/20 bg-black shadow-inner">
                                                {Math.abs(
                                                    index - currentIndex,
                                                ) <=
                                                    visibleCount + 1 ||
                                                activeVideos[index] ? (
                                                    <iframe
                                                        src={embedUrl}
                                                        title={`Testimonial video by ${item.name}`}
                                                        loading="lazy"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
                                                        aria-label={`Play testimonial video by ${item.name}`}
                                                        className="relative flex size-full items-center justify-center bg-stone-900"
                                                    >
                                                        <img
                                                            src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                                                            alt={item.title}
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

                                            {/* Bottom Card Meta & Stars */}
                                            <div className="mt-4 border-t border-amber-400/10 pt-2">
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    {Array.from({
                                                        length: item.rating,
                                                    }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className="size-4 fill-current"
                                                        />
                                                    ))}
                                                </div>
                                                <p className="mt-2 line-clamp-2 font-bengali text-sm leading-snug font-medium text-neutral-200">
                                                    “{item.title}”
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pagination / Indicator Dots */}
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {videoTestimonials.map((_, index) => (
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
