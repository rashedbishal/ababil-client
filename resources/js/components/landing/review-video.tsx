import { Loader2, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
    loadYouTubeApi,
    YT_STATE,
    type YouTubePlayer,
} from '@/lib/youtube-iframe-api';

type Status = 'idle' | 'loading' | 'playing' | 'paused';

// The player is laid out at this fixed size and scaled down to the card (see
// `scale` below). YouTube switches to a compact touch layout - with a big
// centre pause button flashing at the start - in narrow players, so it is
// kept wide. CROP > 1 makes it larger than the card, so whatever YouTube
// draws near the edges falls outside the frame.
const PLAYER_WIDTH = 720;
const PLAYER_HEIGHT = (PLAYER_WIDTH * 16) / 9;
const CROP = 1.3;

// YouTube flashes its own centre pause icon for a few seconds whenever
// playback starts, and that can't be turned off. For that long our own pause
// button sits over the same spot (then fades), so only ours is ever seen.
const INTRO_MS = 5500;

/**
 * One customer video review. Shows a thumbnail until tapped, then plays the
 * YouTube video with none of YouTube's own interface: the control bar is off,
 * the iframe ignores the pointer (so its hover UI never appears), and the
 * only controls are ours - a play button on the thumbnail and a small pause
 * button over the playing video (tapping the video pauses it too).
 *
 * YouTube still draws a title strip / logo / "more videos" panel inside its
 * player at times, so: the player is rendered larger than the frame and
 * cropped by it (those bits fall outside), and whenever the video isn't
 * playing our own thumbnail covers it, which hides the paused/ended screen.
 *
 * If YouTube's API can't be loaded the plain embedded player is used instead,
 * so a review can always still be watched.
 */
export default function ReviewVideo({
    videoId,
    index,
    shouldPause,
    onPlay,
}: {
    videoId: string;
    index: number;
    // Set when another review started playing - this one pauses.
    shouldPause: boolean;
    onPlay: () => void;
}) {
    const [started, setStarted] = useState(false);
    const [status, setStatus] = useState<Status>('idle');
    const [fallback, setFallback] = useState(false);
    // Scale and whole-pixel offset that centre the player on the card. The
    // offset is rounded so the scaled player never sits on a half pixel
    // (card heights are fractional with a 9:16 ratio), which can show as a
    // hairline across the video in some browsers.
    const [placement, setPlacement] = useState({ scale: 0.5, x: 0, y: 0 });
    const [intro, setIntro] = useState(false);
    const mountRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YouTubePlayer | null>(null);
    const hasPlayed = useRef(false);
    const statusRef = useRef<Status>('idle');
    const onPlayRef = useRef(onPlay);
    onPlayRef.current = onPlay;

    function updateStatus(next: Status) {
        statusRef.current = next;
        setStatus(next);
    }

    useEffect(() => {
        if (!started || fallback || !mountRef.current) {
            return;
        }

        let cancelled = false;
        const wrapper = mountRef.current;
        // YT.Player replaces the element it is given with an iframe, so give
        // it a throwaway child - React keeps ownership of `wrapper` itself.
        const target = document.createElement('div');
        wrapper.appendChild(target);

        loadYouTubeApi()
            .then((YT) => {
                if (cancelled) {
                    return;
                }

                playerRef.current = new YT.Player(target, {
                    videoId,
                    playerVars: {
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        origin: window.location.origin,
                    },
                    events: {
                        onReady: ({ target }) => {
                            target.playVideo();
                            // If the browser blocked the autoplay, fall back
                            // to showing the play button instead of spinning.
                            setTimeout(() => {
                                if (statusRef.current === 'loading') {
                                    updateStatus('paused');
                                }
                            }, 3000);
                        },
                        onStateChange: ({ data }) => {
                            if (data === YT_STATE.PLAYING) {
                                hasPlayed.current = true;
                                updateStatus('playing');
                                onPlayRef.current();
                            } else if (data === YT_STATE.ENDED) {
                                // Loop by hand: YouTube's own `loop` needs a
                                // one-video "playlist", which makes its player
                                // draw previous/next buttons. Our cover hides
                                // the end screen while it restarts.
                                updateStatus('loading');
                                playerRef.current?.seekTo(0, true);
                                playerRef.current?.playVideo();
                            } else if (data === YT_STATE.PAUSED) {
                                updateStatus('paused');
                            } else if (
                                data === YT_STATE.BUFFERING &&
                                !hasPlayed.current
                            ) {
                                updateStatus('loading');
                            }
                        },
                        onError: () => setFallback(true),
                    },
                });
            })
            .catch(() => {
                if (!cancelled) {
                    setFallback(true);
                }
            });

        return () => {
            cancelled = true;
            playerRef.current?.destroy();
            playerRef.current = null;
            wrapper.replaceChildren();
        };
    }, [started, fallback, videoId]);

    useEffect(() => {
        if (status !== 'playing') {
            setIntro(false);

            return;
        }

        setIntro(true);
        const timer = setTimeout(() => setIntro(false), INTRO_MS);

        return () => clearTimeout(timer);
    }, [status]);

    useEffect(() => {
        const card = mountRef.current?.parentElement;

        if (!started || !card) {
            return;
        }

        const resize = () => {
            // Snap the scaled player to a half-pixel step so browsers don't
            // leave a thin black line while the YouTube iframe settles into the
            // final frame after the video starts or resumes.
            const scale =
                Math.round(((card.clientWidth * CROP) / PLAYER_WIDTH) * 2) / 2;
            const scaledWidth = PLAYER_WIDTH * scale;
            const scaledHeight = PLAYER_HEIGHT * scale;

            setPlacement({
                scale,
                x: Math.round((card.clientWidth - scaledWidth) / 2),
                y: Math.round((card.clientHeight - scaledHeight) / 2),
            });
        };

        resize();
        const observer = new ResizeObserver(resize);
        observer.observe(card);

        return () => observer.disconnect();
    }, [started]);

    useEffect(() => {
        if (shouldPause && statusRef.current === 'playing') {
            playerRef.current?.pauseVideo();
        }
    }, [shouldPause]);

    function toggle() {
        if (!started) {
            setStarted(true);
            updateStatus('loading');

            return;
        }

        if (statusRef.current === 'playing') {
            playerRef.current?.pauseVideo();
        } else if (statusRef.current === 'paused') {
            updateStatus('loading');
            playerRef.current?.playVideo();
        }
    }

    if (fallback) {
        return (
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1`}
                title={`Customer video review ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full rounded-2xl"
            />
        );
    }

    const showCover = status !== 'playing';

    return (
        <>
            {started && (
                <div
                    ref={mountRef}
                    aria-hidden
                    style={{
                        width: PLAYER_WIDTH,
                        height: PLAYER_HEIGHT,
                        transform: `translate(${placement.x}px, ${placement.y}px) scale(${placement.scale})`,
                        transformOrigin: '0 0',
                    }}
                    className="pointer-events-none absolute top-0 left-0 [&_iframe]:size-full"
                />
            )}

            {showCover && (
                // Fully opaque, so nothing of YouTube's player shows through.
                <div className="pointer-events-none absolute inset-0 bg-stone-900">
                    <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="Customer video review"
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-stone-950/25 transition-colors group-hover:bg-stone-950/10" />
                </div>
            )}

            <button
                type="button"
                onClick={toggle}
                aria-label={
                    status === 'playing'
                        ? `Pause customer video review ${index + 1}`
                        : `Play customer video review ${index + 1}`
                }
                className="absolute inset-0 flex items-center justify-center"
            >
                {showCover ? (
                    <span className="flex size-11 items-center justify-center rounded-full border border-amber-400/40 bg-stone-950/80 text-amber-400 shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110 sm:size-14">
                        {status === 'loading' ? (
                            <Loader2 className="size-5 animate-spin sm:size-6" />
                        ) : (
                            <Play className="size-5 fill-amber-400 sm:size-6" />
                        )}
                    </span>
                ) : (
                    <span
                        aria-hidden
                        className={`flex size-11 items-center justify-center rounded-full border border-amber-400/40 bg-stone-950/80 text-amber-400 shadow-xl backdrop-blur-sm transition-opacity duration-700 group-hover:opacity-100 sm:size-14 ${
                            intro ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <Pause className="size-5 fill-amber-400 sm:size-6" />
                    </span>
                )}
            </button>
        </>
    );
}
