import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Concept3Banner from './concept3-banner';

describe('Concept3Banner', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('opens the order drawer on a tap that does not become a swipe', () => {
        const onOrderClick = vi.fn();
        render(<Concept3Banner onOrderClick={onOrderClick} />);

        const slide = screen.getAllByRole('button', {
            name: 'আবাবিল অর্ডার করুন',
        })[1];

        fireEvent.pointerDown(slide, {
            pointerType: 'touch',
            clientX: 120,
            button: 0,
        });
        fireEvent.pointerUp(slide, {
            pointerType: 'touch',
            clientX: 120,
            button: 0,
        });
        fireEvent.click(slide);

        expect(onOrderClick).toHaveBeenCalledOnce();
    });

    it('does not treat a horizontal swipe as an order tap', () => {
        const onOrderClick = vi.fn();
        render(<Concept3Banner onOrderClick={onOrderClick} />);

        const slide = screen.getAllByRole('button', {
            name: 'আবাবিল অর্ডার করুন',
        })[1];

        fireEvent.pointerDown(slide, {
            pointerType: 'touch',
            clientX: 200,
            button: 0,
        });
        fireEvent.pointerMove(slide, {
            pointerType: 'touch',
            clientX: 80,
        });
        fireEvent.pointerUp(slide, {
            pointerType: 'touch',
            clientX: 80,
            button: 0,
        });
        fireEvent.click(slide);

        expect(onOrderClick).not.toHaveBeenCalled();
    });

    it('rebases from the first-slide clone without animating across the track', () => {
        vi.useFakeTimers();
        const { container } = render(
            <Concept3Banner onOrderClick={() => {}} />,
        );
        const track = container.querySelector<HTMLElement>(
            '[style*="translateX"]',
        );

        if (!track) {
            throw new Error('Banner track was not rendered');
        }

        fireEvent.click(screen.getByRole('button', { name: 'ব্যানার 5' }));
        fireEvent.transitionEnd(track);

        act(() => {
            vi.advanceTimersByTime(4000);
        });

        fireEvent.transitionEnd(track);

        expect(track).toHaveStyle({
            transform: 'translateX(calc(-100% + 0px))',
        });
        expect(track).not.toHaveClass('transition-transform');

        act(() => {
            vi.advanceTimersByTime(4000);
        });

        expect(track).toHaveStyle({
            transform: 'translateX(calc(-200% + 0px))',
        });
        expect(track).toHaveClass('transition-transform');
    });
});
