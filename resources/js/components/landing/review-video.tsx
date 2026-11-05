import { Loader2, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ReviewVideo({
    videoUrl,
    youtubeId = null,
    posterUrl,
    index,
    shouldPause,
    onPlay,
}: {
    videoUrl: string | null;
    // Legacy reviews are a YouTube link instead of a hosted file.
    youtubeId?: string | null;
    posterUrl?: string | null;
    index: number;
    // Set when another review started playing - this one pauses.
    shouldPause: boolean;
    onPlay: () => void;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [youtubeActive, setYoutubeActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPosterUrl, setGeneratedPosterUrl] = useState<string | null>(
        null,
    );
    const [showControls, setShowControls] = useState(true);
    const hoverTimerRef = useRef<number | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        setGeneratedPosterUrl(null);
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !videoUrl) {
            return;
        }

        const createPosterFromVideo = () => {
            try {
                const canvas = document.createElement('canvas');
                const width = video.videoWidth || 720;
                const height = video.videoHeight || 1280;

                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');

                if (!context) {
                    return;
                }

                context.drawImage(video, 0, 0, width, height);
                setGeneratedPosterUrl(canvas.toDataURL('image/jpeg', 0.9));
            } catch {
                // Ignore poster generation failures and fall back to the
                // supplied server poster when available.
            }
        };

        video.addEventListener('loadeddata', createPosterFromVideo);
        video.addEventListener('canplay', createPosterFromVideo);

        return () => {
            video.removeEventListener('loadeddata', createPosterFromVideo);
            video.removeEventListener('canplay', createPosterFromVideo);
        };
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !videoUrl) {
            return;
        }

        if (shouldPause && !video.paused) {
            video.pause();
            setIsPlaying(false);
        }
    }, [shouldPause, videoUrl]);

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            return;
        }

        setShowControls(true);

        if (hoverTimerRef.current) {
            window.clearTimeout(hoverTimerRef.current);
        }

        hoverTimerRef.current = window.setTimeout(() => {
            setShowControls(false);
        }, 1200);

        return () => {
            if (hoverTimerRef.current) {
                window.clearTimeout(hoverTimerRef.current);
            }
        };
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) {
                window.clearTimeout(hoverTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !videoUrl) {
            return;
        }

        video.load();
    }, [videoUrl]);

    async function toggle() {
        const video = videoRef.current;

        if (!video || !videoUrl) {
            return;
        }

        if (video.paused) {
            setIsLoading(true);

            try {
                await video.play();
                setIsPlaying(true);
                setIsLoading(false);
                onPlay();
            } catch {
                setIsLoading(false);
            }

            return;
        }

        video.pause();
        setIsPlaying(false);
    }

    useEffect(() => {
        if (shouldPause) {
            setYoutubeActive(false);
        }
    }, [shouldPause]);

    if (!videoUrl && youtubeId) {
        const youtubePoster =
            posterUrl ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

        if (youtubeActive) {
            return (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${youtubeId}`}
                    title={`Customer video review ${index + 1}`}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    className="size-full border-0"
                />
            );
        }

        return (
            <>
                <img
                    src={youtubePoster}
                    alt="Customer video review"
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-stone-950/20 transition-colors group-hover:bg-stone-950/10" />
                <button
                    type="button"
                    onClick={() => {
                        setYoutubeActive(true);
                        onPlay();
                    }}
                    aria-label={`Play customer video review ${index + 1}`}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <span className="flex size-11 items-center justify-center rounded-full border border-amber-400/40 bg-stone-950/80 text-amber-400 shadow-xl backdrop-blur-sm sm:size-14">
                        <Play className="size-5 fill-amber-400 sm:size-6" />
                    </span>
                </button>
            </>
        );
    }

    const showCover = !videoUrl || !isPlaying;
    const currentPosterUrl = posterUrl ?? generatedPosterUrl ?? null;
    const showButton = showCover || (!showCover && showControls);

    return (
        <>
            {videoUrl && (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    poster={currentPosterUrl ?? undefined}
                    playsInline
                    loop
                    preload="metadata"
                    className="size-full object-cover"
                    onPlay={() => {
                        setIsPlaying(true);
                        setIsLoading(false);
                        onPlay();
                    }}
                    onPause={() => setIsPlaying(false)}
                />
            )}

            {showCover && (
                <div className="pointer-events-none absolute inset-0 bg-stone-900">
                    {currentPosterUrl ? (
                        <img
                            src={currentPosterUrl}
                            alt="Customer video review"
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="size-full bg-stone-950" />
                    )}
                    <div className="absolute inset-0 bg-stone-950/20 transition-colors group-hover:bg-stone-950/10" />
                </div>
            )}

            <button
                type="button"
                onClick={toggle}
                onMouseEnter={() => {
                    setShowControls(true);

                    if (hoverTimerRef.current) {
                        window.clearTimeout(hoverTimerRef.current);
                    }
                }}
                onMouseLeave={() => {
                    if (isPlaying) {
                        hoverTimerRef.current = window.setTimeout(() => {
                            setShowControls(false);
                        }, 250);
                    }
                }}
                aria-label={
                    isPlaying
                        ? `Pause customer video review ${index + 1}`
                        : `Play customer video review ${index + 1}`
                }
                className="absolute inset-0 flex items-center justify-center"
            >
                {showButton && (
                    <span
                        className={[
                            'flex size-11 items-center justify-center rounded-full border border-amber-400/40 bg-stone-950/80 text-amber-400 shadow-xl backdrop-blur-sm transition-all duration-200 sm:size-14',
                            isPlaying && 'opacity-100',
                            !isPlaying && 'opacity-100',
                        ].join(' ')}
                    >
                        {showCover ? (
                            isLoading ? (
                                <Loader2 className="size-5 animate-spin sm:size-6" />
                            ) : (
                                <Play className="size-5 fill-amber-400 sm:size-6" />
                            )
                        ) : (
                            <Pause className="size-5 fill-amber-400 sm:size-6" />
                        )}
                    </span>
                )}
            </button>
        </>
    );
}
