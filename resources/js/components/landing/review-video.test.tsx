import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewVideo from './review-video';
import TestimonialsSection from './testimonials-section';

type Events = {
    onReady?: (event: { target: unknown }) => void;
    onStateChange?: (event: { data: number }) => void;
    onError?: () => void;
};

const player = {
    playVideo: vi.fn(),
    pauseVideo: vi.fn(),
    seekTo: vi.fn(),
    destroy: vi.fn(),
};
let events: Events = {};
let playerVars: Record<string, string | number> = {};
let loadApi: () => Promise<unknown>;

vi.mock('@/lib/youtube-iframe-api', () => ({
    YT_STATE: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 },
    loadYouTubeApi: () => loadApi(),
}));

function installFakeApi() {
    loadApi = () =>
        Promise.resolve({
            Player: class {
                constructor(
                    _el: HTMLElement,
                    options: { playerVars: typeof playerVars; events: Events },
                ) {
                    events = options.events;
                    playerVars = options.playerVars;
                    Object.assign(this, player);
                }
            },
        });
}

function renderVideo(props: Partial<Parameters<typeof ReviewVideo>[0]> = {}) {
    return render(
        <div className="relative">
            <ReviewVideo
                videoId="abc123"
                index={0}
                shouldPause={false}
                onPlay={vi.fn()}
                {...props}
            />
        </div>,
    );
}

describe('ReviewVideo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        events = {};
        playerVars = {};
        installFakeApi();
    });

    it('shows only a thumbnail and a play button until tapped', () => {
        const { container } = renderVideo();

        expect(
            screen.getByRole('button', {
                name: 'Play customer video review 1',
            }),
        ).toBeInTheDocument();
        expect(container.querySelector('iframe')).toBeNull();
    });

    it("asks YouTube for a player with none of YouTube's own controls", async () => {
        renderVideo();
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => expect(events.onStateChange).toBeDefined());

        expect(playerVars).toMatchObject({
            controls: 0,
            fs: 0,
            disablekb: 1,
            iv_load_policy: 3,
            playsinline: 1,
            rel: 0,
        });
        // Looping through `playlist` would bring back YouTube's prev/next buttons.
        expect(playerVars).not.toHaveProperty('playlist');
        expect(playerVars).not.toHaveProperty('loop');
    });

    it('switches between play and pause as the video plays and is paused', async () => {
        const onPlay = vi.fn();
        renderVideo({ onPlay });
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(events.onStateChange).toBeDefined());

        act(() => events.onStateChange?.({ data: 1 }));
        expect(onPlay).toHaveBeenCalledOnce();
        const pause = screen.getByRole('button', {
            name: 'Pause customer video review 1',
        });

        fireEvent.click(pause);
        expect(player.pauseVideo).toHaveBeenCalledOnce();

        act(() => events.onStateChange?.({ data: 2 }));
        fireEvent.click(
            screen.getByRole('button', {
                name: 'Play customer video review 1',
            }),
        );
        expect(player.playVideo).toHaveBeenCalled();
    });

    it('pauses when another review starts playing', async () => {
        const { rerender } = renderVideo();
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(events.onStateChange).toBeDefined());
        act(() => events.onStateChange?.({ data: 1 }));

        rerender(
            <div className="relative">
                <ReviewVideo
                    videoId="abc123"
                    index={0}
                    shouldPause
                    onPlay={vi.fn()}
                />
            </div>,
        );

        expect(player.pauseVideo).toHaveBeenCalledOnce();
    });

    it('loops by restarting itself when the video ends', async () => {
        renderVideo();
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => expect(events.onStateChange).toBeDefined());

        act(() => events.onStateChange?.({ data: 0 }));

        expect(player.seekTo).toHaveBeenCalledWith(0, true);
        expect(player.playVideo).toHaveBeenCalled();
    });

    it("falls back to YouTube's normal embed if the API can't load", async () => {
        loadApi = () => Promise.reject(new Error('blocked'));
        const { container } = renderVideo();
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() =>
            expect(container.querySelector('iframe')).not.toBeNull(),
        );
        expect(
            container.querySelector('iframe')?.getAttribute('src'),
        ).toContain('/embed/abc123');
    });
});

describe('TestimonialsSection slider', () => {
    const reviews = (n: number) =>
        Array.from({ length: n }, (_, i) => ({ id: i + 1, video_id: `v${i}` }));

    it('shows 2 reviews per view and slides the rest', () => {
        const { container, getAllByRole } = render(
            <TestimonialsSection reviews={reviews(5)} />,
        );

        const track = container.querySelector('.snap-x');
        expect(track?.children).toHaveLength(5);
        expect((track!.children[0] as HTMLElement).className).toContain(
            'w-1/2',
        );
        // 3 pages of 2 -> 3 dots
        expect(getAllByRole('button', { name: /^পেজ / })).toHaveLength(3);
    });

    it('has no slider controls when everything fits in one view', () => {
        const { queryByRole } = render(
            <TestimonialsSection reviews={reviews(2)} />,
        );

        expect(queryByRole('button', { name: 'পরের ভিডিও' })).toBeNull();
    });

    it('renders nothing when there are no reviews', () => {
        const { container } = render(<TestimonialsSection reviews={[]} />);

        expect(container).toBeEmptyDOMElement();
    });
});
