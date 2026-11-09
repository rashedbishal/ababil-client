import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import Concept3ProductSection from './concept3-product-section';

function makeCheckout(
    overrides: Omit<Partial<CheckoutForm>, 'data'> & {
        data?: Partial<CheckoutForm['data']>;
    } = {},
): CheckoutForm {
    return {
        setField: vi.fn(),
        setHoneypot: vi.fn(),
        displayShippingAreas: [
            {
                id: 1,
                name: 'Inside Dhaka City Corporation',
                charge: '80.00',
            },
            {
                id: 2,
                name: 'Outside Dhaka City Corporation',
                charge: '130.00',
            },
        ],
        subtotal: 1000,
        shippingCharge: 80,
        grandTotal: 1080,
        errors: {},
        processing: false,
        submit: vi.fn((e: React.FormEvent) => e.preventDefault()),
        orderResult: null,
        clearOrderResult: vi.fn(),
        ...overrides,
        data: {
            quantity: 2,
            customer_name: '',
            customer_phone: '',
            delivery_address: '',
            shipping_area_id: 1,
            website: '',
            ...overrides.data,
        },
    } as unknown as CheckoutForm;
}

function renderSection(checkout: CheckoutForm, onOrderClick = vi.fn()) {
    return render(
        <Concept3ProductSection
            productName="আবাবিল"
            images={[{ id: 1, src: '/a.webp', alt: 'ছবি' }]}
            checkout={checkout}
            onOrderClick={onOrderClick}
        />,
    );
}

describe('Concept3ProductSection checkout', () => {
    it('shows the whole order form on the page, not in a drawer or dialog', () => {
        renderSection(makeCheckout());

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.getElementById('order-form')).toBeInTheDocument();
        expect(screen.getByLabelText('আপনার নাম কী?')).toBeInTheDocument();
        expect(
            screen.getByLabelText('যোগাযোগের মোবাইল নম্বর'),
        ).toBeInTheDocument();
        expect(screen.getByLabelText('ঠিকানা')).toBeInTheDocument();
        expect(screen.getByText('৳1080')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'অর্ডার কনফার্ম করুন →' }),
        ).toBeInTheDocument();
    });

    it('shows the selected delivery location beside the delivery charge', () => {
        const { unmount } = renderSection(makeCheckout());

        expect(
            screen.getByText('ঢাকা সিটি কর্পোরেশনের ভিতরে', {
                selector: 'span',
            }),
        ).toBeInTheDocument();
        unmount();

        const outsideCheckout = makeCheckout({
            data: {
                quantity: 2,
                customer_name: '',
                customer_phone: '',
                delivery_address: '',
                shipping_area_id: 2,
                website: '',
            },
        });
        const outsideRender = renderSection(outsideCheckout);

        expect(
            screen.getByText('ঢাকা সিটি কর্পোরেশনের বাইরে', {
                selector: 'span',
            }),
        ).toBeInTheDocument();
        outsideRender.unmount();
    });

    it('submits the order through the checkout hook', () => {
        const checkout = makeCheckout();
        renderSection(checkout);

        fireEvent.submit(
            screen
                .getByRole('button', { name: 'অর্ডার কনফার্ম করুন →' })
                .closest('form')!,
        );

        expect(checkout.submit).toHaveBeenCalledOnce();
    });

    it('writes field edits to the shared checkout state', () => {
        const checkout = makeCheckout();
        renderSection(checkout);

        fireEvent.change(screen.getByLabelText('আপনার নাম কী?'), {
            target: { value: 'রহিম' },
        });
        fireEvent.change(screen.getByLabelText('যোগাযোগের মোবাইল নম্বর'), {
            target: { value: '01712345678' },
        });

        expect(checkout.setField).toHaveBeenCalledWith('customer_name', 'রহিম');
        expect(checkout.setField).toHaveBeenCalledWith(
            'customer_phone',
            '01712345678',
        );
    });

    it('disables the button and shows progress while the order is processing', () => {
        renderSection(makeCheckout({ processing: true }));

        expect(
            screen.getByRole('button', { name: 'অর্ডার হচ্ছে...' }),
        ).toBeDisabled();
    });

    it('leaves showing the order result to the result dialog, keeping the form in place', () => {
        renderSection(
            makeCheckout({
                orderResult: {
                    type: 'success',
                    orderNumber: 'ORD-1001',
                    customerName: 'রহিম',
                    shippingAreaName: 'ঢাকার ভিতরে',
                    grandTotal: '1080.00',
                },
            }),
        );

        expect(
            screen.queryByText('অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!'),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('ORD-1001')).not.toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'অর্ডার কনফার্ম করুন →' }),
        ).toBeInTheDocument();
    });
});
