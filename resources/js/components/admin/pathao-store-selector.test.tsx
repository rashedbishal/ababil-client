import { useForm } from '@inertiajs/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PathaoStoreSelector } from './pathao-store-selector';

vi.mock('@inertiajs/react', () => ({
    useForm: vi.fn((initialData: Record<string, unknown>) => ({
        data: initialData,
        setData: vi.fn(),
        put: vi.fn(),
        processing: false,
    })),
}));

describe('PathaoStoreSelector', () => {
    beforeEach(() => {
        vi.mocked(useForm).mockClear();
        document.cookie = 'XSRF-TOKEN=test-token';
    });

    it('selects and saves a freshly fetched store even when it differs from the previously saved one', async () => {
        // Regression test for a real bug: selectedStoreId used to stay
        // pinned to whatever store was previously saved (111 here), so once
        // a fresh fetch returned a different store list, Save silently
        // no-opped because nothing in the new list matched the stale id.
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    stores: [
                        {
                            id: 999,
                            name: 'New Real Store',
                            address: 'Somewhere, Dhaka',
                        },
                    ],
                }),
            }),
        );

        render(
            <PathaoStoreSelector
                store={{ id: 111, name: 'Old Stale Store' }}
            />,
        );

        expect(screen.getByText(/Old Stale Store/)).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole('button', {
                name: /Fetch my stores from Pathao/i,
            }),
        );

        await waitFor(() =>
            expect(screen.getByText(/New Real Store/)).toBeInTheDocument(),
        );

        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeEnabled();

        fireEvent.click(saveButton);

        const formInstance = vi.mocked(useForm).mock.results.at(-1)!.value;
        expect(formInstance.setData).toHaveBeenCalledWith({
            store_id: 999,
            store_name: 'New Real Store',
        });
        expect(formInstance.put).toHaveBeenCalledTimes(1);
    });

    it('shows a fetch error and does not offer a store list on failure', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ message: 'Failed to fetch stores.' }),
            }),
        );

        render(<PathaoStoreSelector store={null} />);

        fireEvent.click(
            screen.getByRole('button', {
                name: /Fetch my stores from Pathao/i,
            }),
        );

        await waitFor(() =>
            expect(
                screen.getByText('Failed to fetch stores.'),
            ).toBeInTheDocument(),
        );

        expect(
            screen.queryByRole('button', { name: 'Save' }),
        ).not.toBeInTheDocument();
    });

    it('keeps the current selection when it still exists in a freshly fetched list', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({
                    stores: [
                        {
                            id: 111,
                            name: 'Still Here Store',
                            address: 'Somewhere',
                        },
                        {
                            id: 222,
                            name: 'Another Store',
                            address: 'Elsewhere',
                        },
                    ],
                }),
            }),
        );

        render(
            <PathaoStoreSelector
                store={{ id: 111, name: 'Still Here Store' }}
            />,
        );

        fireEvent.click(
            screen.getByRole('button', {
                name: /Fetch my stores from Pathao/i,
            }),
        );

        await waitFor(() =>
            expect(screen.getByText(/Another Store/)).toBeInTheDocument(),
        );

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        const formInstance = vi.mocked(useForm).mock.results.at(-1)!.value;
        expect(formInstance.setData).toHaveBeenCalledWith({
            store_id: 111,
            store_name: 'Still Here Store',
        });
    });
});
