/**
 * Minimal types and a lazy loader for YouTube's IFrame Player API
 * (https://developers.google.com/youtube/iframe_api_reference). The script is
 * only fetched the first time a visitor taps a review video, so it costs
 * nothing for page loads that never play one.
 */
export const YT_STATE = {
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
} as const;

export type YouTubePlayer = {
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    destroy(): void;
};

type YouTubeNamespace = {
    Player: new (
        element: HTMLElement,
        options: {
            videoId: string;
            playerVars: Record<string, string | number>;
            events: {
                onReady?: (event: { target: YouTubePlayer }) => void;
                onStateChange?: (event: { data: number }) => void;
                onError?: () => void;
            };
        },
    ) => YouTubePlayer;
};

type YouTubeWindow = Window & {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
};

let apiPromise: Promise<YouTubeNamespace> | null = null;

export function loadYouTubeApi(): Promise<YouTubeNamespace> {
    if (apiPromise) {
        return apiPromise;
    }

    apiPromise = new Promise((resolve, reject) => {
        const w = window as YouTubeWindow;

        if (w.YT?.Player) {
            resolve(w.YT);

            return;
        }

        const previous = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => {
            previous?.();

            if (w.YT?.Player) {
                resolve(w.YT);
            } else {
                reject(new Error('YouTube API did not initialise'));
            }
        };

        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        script.onerror = () => {
            apiPromise = null;
            reject(new Error('YouTube API failed to load'));
        };
        document.head.appendChild(script);
    });

    return apiPromise;
}
