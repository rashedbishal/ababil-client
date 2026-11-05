import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ReviewVideo from './review-video';
import TestimonialsSection from './testimonials-section';

function renderVideo(props: Partial<Parameters<typeof ReviewVideo>[0]> = {}) {
    return render(
        <div className="relative">
            <ReviewVideo
                videoUrl="https://example.com/review.mp4"
                posterUrl="https://example.com/preview.jpg"
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
    });

    it('shows a thumbnail cover and play button until tapped', () => {
        const { container } = renderVideo();

        expect(
            screen.getByRole('button', {
                name: 'Play customer video review 1',
            }),
        ).toBeInTheDocument();
        expect(container.querySelector('video')).toBeInTheDocument();
    });

    it('plays the hosted video and calls onPlay', async () => {
        const onPlay = vi.fn();
        const { container } = renderVideo({ onPlay });
        const video = container.querySelector('video') as HTMLVideoElement;
        const play = vi.spyOn(video, 'play').mockResolvedValue(undefined);
        fireEvent.click(screen.getByRole('button'));

        await waitFor(() => {
            expect(play).toHaveBeenCalledOnce();
            expect(onPlay).toHaveBeenCalledOnce();
        });

        fireEvent(video, new Event('pause'));
        expect(
            screen.getByRole('button', {
                name: 'Play customer video review 1',
            }),
        ).toBeInTheDocument();
    });

    it('embeds a youtube review when tapped and calls onPlay', () => {
        const onPlay = vi.fn();
        const { container } = renderVideo({
            videoUrl: null,
            posterUrl: null,
            youtubeId: 'dQw4w9WgXcQ',
            onPlay,
        });

        expect(container.querySelector('video')).not.toBeInTheDocument();
        expect(container.querySelector('iframe')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button'));

        const frame = container.querySelector('iframe') as HTMLIFrameElement;
        expect(frame.src).toContain('/embed/dQw4w9WgXcQ?autoplay=1');
        expect(onPlay).toHaveBeenCalledOnce();
    });

    it('pauses when another review starts playing', async () => {
        const { rerender } = renderVideo();
        const video = document.querySelector('video') as HTMLVideoElement;
        const pause = vi.spyOn(video, 'pause').mockImplementation(() => {});

        Object.defineProperty(video, 'paused', {
            configurable: true,
            get: () => false,
        });

        fireEvent.click(screen.getByRole('button'));
        fireEvent(video, new Event('play'));

        rerender(
            <div className="relative">
                <ReviewVideo
                    videoUrl="https://example.com/review.mp4"
                    posterUrl="https://example.com/preview.jpg"
                    index={0}
                    shouldPause
                    onPlay={vi.fn()}
                />
            </div>,
        );

        await waitFor(() => {
            expect(pause).toHaveBeenCalled();
        });
    });
});

describe('TestimonialsSection slider', () => {
    const reviews = (n: number) =>
        Array.from({ length: n }, (_, i) => ({
            id: i + 1,
            video_url: `https://example.com/v${i}.mp4`,
            thumbnail_url: `https://example.com/t${i}.jpg`,
        }));

    it('shows 2 reviews per view and slides the rest', () => {
        const { container, getAllByRole } = render(
            <TestimonialsSection reviews={reviews(5)} />,
        );

        const track = container.querySelector('.snap-x');
        expect(track?.children).toHaveLength(5);
        expect((track!.children[0] as HTMLElement).className).toContain(
            'w-1/2',
        );
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
