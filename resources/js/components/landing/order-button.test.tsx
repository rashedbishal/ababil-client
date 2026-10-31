import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OrderButton from './order-button';

describe('OrderButton', () => {
    it('renders a button (not a link) when onClick is provided', () => {
        const onClick = vi.fn();
        render(<OrderButton onClick={onClick}>অর্ডার করুন</OrderButton>);

        const control = screen.getByRole('button', { name: 'অর্ডার করুন' });
        expect(control.tagName).toBe('BUTTON');
        expect(control).toHaveAttribute('type', 'button');
        expect(screen.queryByRole('link')).toBeNull();

        fireEvent.click(control);
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('renders an in-page link when onClick is omitted', () => {
        render(<OrderButton href="#product">অর্ডার করুন</OrderButton>);

        const control = screen.getByRole('link', { name: 'অর্ডার করুন' });
        expect(control).toHaveAttribute('href', '#product');
    });
});
