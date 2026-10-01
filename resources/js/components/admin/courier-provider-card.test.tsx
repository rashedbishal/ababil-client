import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CourierProviderCard, type Provider } from './courier-provider-card';

vi.mock('@inertiajs/react', async () => {
    const { useState } = await import('react');

    return {
        useForm: (initial: Record<string, string>) => {
            const [data, setDataState] = useState(initial);

            function setData(key: string, value: string) {
                setDataState((current) => ({ ...current, [key]: value }));
            }

            return {
                data,
                setData,
                put: vi.fn(),
                processing: false,
                errors: {},
            };
        },
        router: { put: vi.fn() },
    };
});

function pathaoProvider(overrides: Partial<Provider> = {}): Provider {
    return {
        name: 'pathao',
        label: 'Pathao',
        enabled: true,
        is_default: true,
        store: null,
        fields: [
            {
                key: 'delivery_type',
                label: 'Delivery Type',
                secret: false,
                value: '48',
                configured: true,
                options: [
                    { value: '48', label: 'Normal Delivery' },
                    { value: '12', label: 'On Demand Delivery' },
                ],
            },
            {
                key: 'item_type',
                label: 'Item Type',
                secret: false,
                value: '2',
                configured: true,
                options: [
                    { value: '2', label: 'Parcel' },
                    { value: '1', label: 'Document' },
                ],
            },
        ],
        ...overrides,
    };
}

describe('CourierProviderCard delivery/item type dropdowns', () => {
    it('defaults the delivery type select to the saved value, not the first option', () => {
        render(
            <CourierProviderCard
                provider={pathaoProvider()}
                canChangeDefault={false}
            />,
        );

        const select = screen.getByLabelText(
            'Delivery Type',
        ) as HTMLSelectElement;
        expect(select.value).toBe('48');
    });

    it('switching the delivery type dropdown updates the underlying code sent to the backend, not just the label', () => {
        render(
            <CourierProviderCard
                provider={pathaoProvider()}
                canChangeDefault={false}
            />,
        );

        const select = screen.getByLabelText(
            'Delivery Type',
        ) as HTMLSelectElement;
        fireEvent.change(select, { target: { value: '12' } });

        expect(select.value).toBe('12');
    });

    it('switching the item type dropdown updates independently of delivery type', () => {
        render(
            <CourierProviderCard
                provider={pathaoProvider()}
                canChangeDefault={false}
            />,
        );

        const itemType = screen.getByLabelText(
            'Item Type',
        ) as HTMLSelectElement;
        const deliveryType = screen.getByLabelText(
            'Delivery Type',
        ) as HTMLSelectElement;

        fireEvent.change(itemType, { target: { value: '1' } });

        expect(itemType.value).toBe('1');
        expect(deliveryType.value).toBe('48');
    });

    it('renders a plain text input (not a dropdown) for fields without options', () => {
        render(
            <CourierProviderCard
                provider={pathaoProvider({
                    fields: [
                        {
                            key: 'base_url',
                            label: 'Base URL',
                            secret: false,
                            value: 'https://courier-api-sandbox.pathao.com',
                            configured: true,
                            options: null,
                        },
                    ],
                })}
                canChangeDefault={false}
            />,
        );

        const field = screen.getByLabelText('Base URL');
        expect(field.tagName).toBe('INPUT');
    });

    it('disables the dropdown when the provider is disabled', () => {
        render(
            <CourierProviderCard
                provider={pathaoProvider({ enabled: false })}
                canChangeDefault={false}
            />,
        );

        expect(screen.getByLabelText('Delivery Type')).toBeDisabled();
    });
});
