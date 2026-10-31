import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import Concept3OrderDrawer from './concept3-order-drawer';

const checkout = {
    data: {
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: 1,
        website: '',
    },
    setField: vi.fn(),
    setHoneypot: vi.fn(),
    displayShippingAreas: [
        { id: 1, name: 'ঢাকার ভিতরে', charge: '80.00' },
        { id: 2, name: 'ঢাকার বাইরে', charge: '130.00' },
    ],
    subtotal: 500,
    shippingCharge: 80,
    grandTotal: 580,
    errors: {},
    processing: false,
    submit: vi.fn((e: React.FormEvent) => e.preventDefault()),
} as unknown as CheckoutForm;

describe('Concept3OrderDrawer', () => {
    it('shows the order form when open', () => {
        render(
            <Concept3OrderDrawer
                open
                onOpenChange={vi.fn()}
                productName="আবাবিল"
                images={[]}
                checkout={checkout}
            />,
        );

        expect(
            screen.getByRole('dialog', { name: 'আপনার অর্ডার' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'অর্ডার কনফার্ম করুন →' }),
        ).toBeInTheDocument();
    });
});
