import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import OrderTriggerButton from './order-trigger-button';

describe('OrderTriggerButton', () => {
    it('is a type=button control that fires onClick', () => {
        const onClick = vi.fn();
        render(
            <OrderTriggerButton onClick={onClick}>অর্ডার করুন</OrderTriggerButton>,
        );

        const control = screen.getByRole('button', { name: 'অর্ডার করুন' });
        expect(control).toHaveAttribute('type', 'button');

        fireEvent.click(control);
        expect(onClick).toHaveBeenCalledOnce();
    });
});
