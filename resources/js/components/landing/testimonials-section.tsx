import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Reveal from './motion/reveal';
import ReviewVideo from './review-video';

interface VideoReview {
    id: number;
    video_id: string;
}

export default function TestimonialsSection({
    reviews,
}: {
    reviews: VideoReview[];
}) {
    // Every reel shows its thumbnail until tapped (see ReviewVideo) - loading
    // a YouTube player for each one up front would be heavy, especially on
    // mobile. Only one plays at a time: the one that last started.
    const [playingId, setPlayingId] = useState<number | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(0);

    // A page is two reels (the width of the track), so the page number is
    // just how many track-widths we have scrolled.
    const pageCount = Math.ceil(reviews.length / 2);

    const syncPage = useCallback(() => {
        const track = trackRef.current;

        if (track && track.clientWidth > 0) {
            setPage(Math.round(track.scrollLeft / track.clientWidth));
        }
    }, []);

    const goToPage = (next: number) => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const target = Math.min(Math.max(next, 0), pageCount - 1);

        track.scrollTo({
            left: target * track.clientWidth,
            behavior: 'smooth',
        });
    };

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

                {/* Reels slider: always 2 reels in view on every screen size,
                    the rest slide in (swipe, arrows or dots). The width is
                    capped so a reel on desktop is a normal phone-video size
                    instead of filling half the page. */}
                <div className="mx-auto mt-8 max-w-[760px] sm:mt-12">
                    <div className="relative">
                        <div
                            ref={trackRef}
                            onScroll={syncPage}
                            className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
                        >
                            {reviews.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="w-1/2 shrink-0 snap-start px-1.5 sm:px-2.5"
                                >
                                    <div className="group relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-amber-500/20 bg-black shadow-inner">
                                        <ReviewVideo
                                            videoId={item.video_id}
                                            index={index}
                                            shouldPause={
                                                playingId !== null &&
                                                playingId !== item.id
                                            }
                                            onPlay={() => setPlayingId(item.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pageCount > 1 && (
                            <>
                                <button
                                    type="button"
                                    aria-label="আগের ভিডিও"
                                    disabled={page === 0}
                                    onClick={() => goToPage(page - 1)}
                                    className="absolute top-1/2 left-0 z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-500/40 bg-stone-950/90 text-amber-400 shadow-lg transition hover:bg-stone-900 disabled:opacity-30 sm:size-10 lg:-left-14 lg:translate-x-0"
                                >
                                    <ChevronLeft className="size-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="পরের ভিডিও"
                                    disabled={page >= pageCount - 1}
                                    onClick={() => goToPage(page + 1)}
                                    className="absolute top-1/2 right-0 z-10 flex size-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-500/40 bg-stone-950/90 text-amber-400 shadow-lg transition hover:bg-stone-900 disabled:opacity-30 sm:size-10 lg:-right-14 lg:translate-x-0"
                                >
                                    <ChevronRight className="size-5" />
                                </button>
                            </>
                        )}
                    </div>
                    {pageCount > 1 && (
                        <div className="mt-5 flex items-center justify-center gap-2">
                            {Array.from({ length: pageCount }, (_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    aria-label={`পেজ ${i + 1}`}
                                    aria-current={i === page}
                                    onClick={() => goToPage(i)}
                                    className={`h-2 rounded-full transition-all ${
                                        i === page
                                            ? 'w-6 bg-amber-400'
                                            : 'w-2 bg-amber-400/30'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
