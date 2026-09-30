import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import {
    CourierProviderCard,
    type Provider,
} from '@/components/admin/courier-provider-card';
import { PathaoStoreSelector } from '@/components/admin/pathao-store-selector';
import { dashboard } from '@/routes/admin';
import courier from '@/routes/admin/courier';

export default function CourierIndex({
    defaultProvider,
    providers,
}: {
    defaultProvider: string | null;
    providers: Provider[];
}) {
    return (
        <>
            <Head title="Courier Integration" />

            <Heading
                title="Courier Integration"
                description="Configure courier providers and choose which one is active. Credentials are stored encrypted and never shown once saved."
            />

            {!defaultProvider && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    No provider is set as default, so orders can&apos;t be
                    submitted to a courier yet.
                </p>
            )}

            <div className="space-y-6">
                {providers.map((provider) => (
                    <CourierProviderCard
                        key={provider.name}
                        provider={provider}
                    >
                        {provider.name === 'pathao' && (
                            <PathaoStoreSelector store={provider.store} />
                        )}
                    </CourierProviderCard>
                ))}
            </div>

            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                <p>
                    Pathao is implemented against their documented Merchant API.
                    Pathao does not document a cancel-order endpoint, so
                    cancellation isn&apos;t available here - cancel from the
                    Pathao merchant dashboard instead. Steadfast and RedX are
                    placeholders: their credentials can be saved here, but no
                    integration has been implemented for them yet.
                </p>
            </div>
        </>
    );
}

CourierIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Courier Integration', href: courier.index() },
    ],
};
