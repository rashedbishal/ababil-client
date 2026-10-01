import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CheckoutSection from './checkout-section';

const shippingAreas = [
    { id: 1, name: 'ঢাকার ভিতরে', charge: '80.00' },
    { id: 2, name: 'ঢাকার বাইরে', charge: '130.00' },
];

function renderCheckout(
    overrides: Partial<Parameters<typeof CheckoutSection>[0]> = {},
) {
    const props = {
        productName: 'Ababil Hair Oil',
        quantity: 1,
        onQuantityChange: vi.fn(),
        customerName: '',
        onCustomerNameChange: vi.fn(),
        customerPhone: '',
        onCustomerPhoneChange: vi.fn(),
        deliveryAddress: '',
        onDeliveryAddressChange: vi.fn(),
        shippingAreas,
        shippingAreaId: null,
        onShippingAreaChange: vi.fn(),
        customerNote: '',
        onCustomerNoteChange: vi.fn(),
        honeypotValue: '',
        onHoneypotChange: vi.fn(),
        subtotal: 500,
        shippingCharge: 80,
        grandTotal: 580,
        errors: {},
        processing: false,
        onSubmit: vi.fn((e) => e.preventDefault()),
        ...overrides,
    };

    render(<CheckoutSection {...props} />);

    return props;
}

describe('CheckoutSection', () => {
    it('renders the order totals passed in from the parent', () => {
        renderCheckout({
            subtotal: 1000,
            shippingCharge: 80,
            grandTotal: 1080,
        });

        expect(screen.getByText('৳1000.00')).toBeInTheDocument();
        expect(screen.getByText('৳80.00')).toBeInTheDocument();
        expect(screen.getByText('৳1080.00')).toBeInTheDocument();
    });

    it('the honeypot field is present but hidden from real visitors', () => {
        renderCheckout();

        const honeypot = document.querySelector('input[name="website"]');
        expect(honeypot).not.toBeNull();
        expect(honeypot).toHaveAttribute('tabIndex', '-1');
        expect(honeypot?.parentElement).toHaveAttribute('aria-hidden', 'true');
    });

    it('typing into the honeypot field reports it back to the parent', () => {
        const props = renderCheckout();

        const honeypot = document.querySelector('input[name="website"]')!;
        fireEvent.change(honeypot, {
            target: { value: 'https://spammer.example' },
        });

        expect(props.onHoneypotChange).toHaveBeenCalledWith(
            'https://spammer.example',
        );
    });

    it('changing the quantity stepper calls back with the new quantity', () => {
        const props = renderCheckout({ quantity: 2 });

        fireEvent.click(screen.getByLabelText('পরিমাণ বাড়ান'));

        expect(props.onQuantityChange).toHaveBeenCalledWith(3);
    });

    it('submitting the form calls onSubmit', () => {
        const props = renderCheckout({
            customerName: 'Jane Doe',
            customerPhone: '01711111111',
            deliveryAddress: '123 Example Road, Dhaka',
        });

        fireEvent.click(screen.getByRole('button', { name: /অর্ডার কনফার্ম করুন/ }));

        expect(props.onSubmit).toHaveBeenCalledTimes(1);
    });

    it('disables the submit button while processing', () => {
        renderCheckout({ processing: true });

        expect(
            screen.getByRole('button', { name: /অর্ডার হচ্ছে/ }),
        ).toBeDisabled();
    });

    it('displays a field-level validation error', () => {
        renderCheckout({ errors: { customer_phone: 'ফোন নম্বরটি সঠিক নয়' } });

        expect(screen.getByText('ফোন নম্বরটি সঠিক নয়')).toBeInTheDocument();
    });

    it('displays a top-level order error', () => {
        renderCheckout({ errors: { order: 'কিছু একটা সমস্যা হয়েছে' } });

        expect(screen.getByText('কিছু একটা সমস্যা হয়েছে')).toBeInTheDocument();
    });
});
