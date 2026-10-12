import { Play } from 'lucide-react';
import { useState } from 'react';
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
    // Every reel shows its thumbnail until tapped - a grid can put 5+
    // reels on screen at once, and loading that many YouTube players up
    // front would be heavy, especially on mobile.
    const [activeVideos, setActiveVideos] = useState<Record<number, boolean>>(
        {},
    );

    if (reviews.length === 0) {
        return null;
    }

    return (
        <section
            id="reviews"
            className="relative scroll-mt-24 overflow-hidden bg-stone-950 py-8 sm:py-16"
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

                {/* Reels grid: 2 per row on mobile, 3 on tablet, 5 on desktop */}
                <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5 lg:gap-5">
                    {reviews.map((item, index) => (
                        <div
                            key={item.id}
                            className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-amber-500/20 bg-black shadow-inner"
                        >
                            {activeVideos[item.id] ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${item.video_id}?autoplay=1&playsinline=1&loop=1&playlist=${item.video_id}&controls=1&rel=0&modestbranding=1`}
                                    title={`Customer video review ${index + 1}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="size-full rounded-2xl"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveVideos((prev) => ({
                                            ...prev,
                                            [item.id]: true,
                                        }))
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
                                    <span className="absolute flex size-11 items-center justify-center rounded-full border border-amber-400/40 bg-stone-950/80 text-amber-400 shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110 sm:size-14">
                                        <Play className="size-5 fill-amber-400 sm:size-6" />
                                    </span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
