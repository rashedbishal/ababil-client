import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes/admin';
import courier from '@/routes/admin/courier';

type Provider = { name: string; configured: boolean };

export default function CourierIndex({
    defaultProvider,
    providers,
}: {
    defaultProvider: string;
    providers: Provider[];
}) {
    return (
        <>
            <Head title="Courier Integration" />

            <Heading
                title="Courier Integration"
                description="Provider credentials are configured via environment variables only - never here or in the frontend."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Active provider</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant="outline">{defaultProvider}</Badge>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Set{' '}
                        <code className="rounded bg-muted px-1">
                            COURIER_DEFAULT
                        </code>{' '}
                        in your environment to switch providers once a real
                        integration has been implemented against that
                        provider&apos;s API.
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                {providers.map((provider) => (
                    <Card key={provider.name}>
                        <CardHeader>
                            <CardTitle className="capitalize">
                                {provider.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {provider.configured ? (
                                <Badge>Credentials set</Badge>
                            ) : (
                                <Badge variant="secondary">
                                    Not configured
                                </Badge>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>How this works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        Orders depend on{' '}
                        <code className="rounded bg-muted px-1">
                            CourierServiceInterface
                        </code>{' '}
                        rather than a specific provider. Once real API docs and
                        credentials are available for a provider, implement that
                        interface for it and bind it in
                        <code className="rounded bg-muted px-1">
                            config/courier.php
                        </code>
                        .
                    </p>
                    <p>
                        Every order already has courier fields (provider,
                        consignment ID, tracking code, courier status) ready to
                        populate once submission is wired up.
                    </p>
                </CardContent>
            </Card>
        </>
    );
}

CourierIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Courier Integration', href: courier.index() },
    ],
};
