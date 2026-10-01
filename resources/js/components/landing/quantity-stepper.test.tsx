import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuantityStepper from './quantity-stepper';

describe('QuantityStepper', () => {
    it('renders the current value', () => {
        render(<QuantityStepper value={3} onChange={() => {}} />);

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('increments by one when the plus button is clicked', () => {
        const onChange = vi.fn();
        render(<QuantityStepper value={3} onChange={onChange} />);

        fireEvent.click(screen.getByLabelText('পরিমাণ বাড়ান'));

        expect(onChange).toHaveBeenCalledWith(4);
    });

    it('decrements by one when the minus button is clicked', () => {
        const onChange = vi.fn();
        render(<QuantityStepper value={3} onChange={onChange} />);

        fireEvent.click(screen.getByLabelText('পরিমাণ কমান'));

        expect(onChange).toHaveBeenCalledWith(2);
    });

    it('disables the minus button at the minimum and never calls onChange below it', () => {
        const onChange = vi.fn();
        render(<QuantityStepper value={1} onChange={onChange} min={1} />);

        const decrement = screen.getByLabelText('পরিমাণ কমান');
        expect(decrement).toBeDisabled();

        fireEvent.click(decrement);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('disables the plus button at the maximum and never calls onChange above it', () => {
        const onChange = vi.fn();
        render(<QuantityStepper value={50} onChange={onChange} max={50} />);

        const increment = screen.getByLabelText('পরিমাণ বাড়ান');
        expect(increment).toBeDisabled();

        fireEvent.click(increment);
        expect(onChange).not.toHaveBeenCalled();
    });
});
