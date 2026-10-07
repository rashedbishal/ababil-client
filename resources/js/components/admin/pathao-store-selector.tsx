import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import courierPathao from '@/routes/admin/courier/pathao';

type Store = { id: number; name: string; address: string };

export function PathaoStoreSelector({
    store,
}: {
    store: { id: number; name: string | null } | null;
}) {
    const [stores, setStores] = useState<Store[] | null>(null);
    const [fetching, setFetching] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(
        store?.id ?? null,
    );

    const saveForm = useForm({
        store_id: store?.id ?? 0,
        store_name: store?.name ?? '',
    });

    async function fetchStores() {
        setFetching(true);
        setFetchError(null);

        try {
            const csrf = decodeURIComponent(
                document.cookie
                    .split('; ')
                    .find((row) => row.startsWith('XSRF-TOKEN='))
                    ?.split('=')[1] ?? '',
            );

            const response = await fetch(courierPathao.stores().url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': csrf,
                },
            });

            const body = await response.json();

            if (!response.ok) {
                setFetchError(body.message ?? 'Failed to fetch stores.');

                return;
            }

            setStores(body.stores);
            setSelectedStoreId((current: number | null) =>
                body.stores.some((s: Store) => s.id === current)
                    ? current
                    : (body.stores[0]?.id ?? null),
            );
        } catch {
            setFetchError('Failed to fetch stores.');
        } finally {
            setFetching(false);
        }
    }

    const selectedStore = stores?.find((s) => s.id === selectedStoreId);

    function saveStore(e: React.FormEvent) {
        e.preventDefault();

        const chosen = stores?.find((s) => s.id === selectedStoreId);

        if (!chosen) {
            return;
        }

        saveForm.setData({ store_id: chosen.id, store_name: chosen.name });
        saveForm.put(courierPathao.store().url, { preserveScroll: true });
    }

    return (
        <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-medium">Pickup store</h3>

            {store ? (
                <p className="mb-3 text-sm">
                    Currently: <span className="font-medium">{store.name}</span>{' '}
                    (ID {store.id})
                </p>
            ) : (
                <p className="mb-3 text-sm text-muted-foreground">
                    No store selected yet.
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchStores}
                    disabled={fetching}
                >
                    {fetching ? 'Fetching…' : 'Fetch my stores from Pathao'}
                </Button>

                {stores !== null && stores.length > 0 && (
                    <form
                        onSubmit={saveStore}
                        className="flex items-center gap-2"
                    >
                        <Select
                            value={
                                selectedStoreId !== null
                                    ? String(selectedStoreId)
                                    : undefined
                            }
                            onValueChange={(value) =>
                                setSelectedStoreId(Number(value))
                            }
                        >
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Select a store…">
                                    {selectedStore &&
                                        `${selectedStore.name} — ${selectedStore.address}`}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {stores.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.name} — {s.address}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                saveForm.processing || selectedStoreId === null
                            }
                        >
                            Save
                        </Button>
                    </form>
                )}
            </div>

            {stores !== null && stores.length === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                    No stores found on this Pathao account.
                </p>
            )}

            {fetchError && (
                <p className="mt-2 text-sm text-destructive">{fetchError}</p>
            )}
        </div>
    );
}
