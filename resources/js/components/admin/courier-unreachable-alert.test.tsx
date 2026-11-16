import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CourierUnreachableAlert } from './courier-unreachable-alert';

type CourierHealth = {
    unreachable: boolean;
    since: string | null;
    alert: boolean;
} | null;

const page = vi.hoisted(() => ({
    props: { courierHealth: null as CourierHealth },
}));

const post = vi.hoisted(() => vi.fn());

vi.mock('@inertiajs/react', () => ({
    usePage: () => page,
    router: { post },
}));

const SINCE = '2026-11-16T07:41:01+06:00';

describe('CourierUnreachableAlert', () => {
    beforeEach(() => {
        post.mockClear();
    });

    it('stays hidden while the courier is healthy', () => {
        page.props.courierHealth = {
            unreachable: false,
            since: null,
            alert: false,
        };

        render(<CourierUnreachableAlert />);

        expect(
            screen.queryByText('Courier service unreachable'),
        ).not.toBeInTheDocument();
    });

    it('stays hidden once already dismissed for this outage', () => {
        page.props.courierHealth = {
            unreachable: true,
            since: SINCE,
            alert: false,
        };

        render(<CourierUnreachableAlert />);

        expect(
            screen.queryByText('Courier service unreachable'),
        ).not.toBeInTheDocument();
    });

    it('shows the alert and records the dismissal on the server when closed', () => {
        page.props.courierHealth = {
            unreachable: true,
            since: SINCE,
            alert: true,
        };

        render(<CourierUnreachableAlert />);

        expect(
            screen.getByText('Courier service unreachable'),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

        expect(post).toHaveBeenCalledTimes(1);
        expect(post.mock.calls[0][0]).toContain('/admin/courier/alert/dismiss');
        expect(
            screen.queryByText('Courier service unreachable'),
        ).not.toBeInTheDocument();
    });
});
