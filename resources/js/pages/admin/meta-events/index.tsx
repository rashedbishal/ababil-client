import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import metaEvents from '@/routes/admin/meta-events';
import orders from '@/routes/admin/orders';
import type { Paginated } from '@/types';

type MetaEventLog = {
    id: number;
    order_id: number | null;
    order_number: string | null;
    event_name: string;
    event_id: string | null;
    status: 'success' | 'failed';
    status_label: string;
    http_status: number | null;
    message: string | null;
    created_at: string | null;
};

export default function MetaEventLogIndex({
    logs,
}: {
    logs: Paginated<MetaEventLog>;
}) {
    const [confirmingClear, setConfirmingClear] = useState(false);
    const [processing, setProcessing] = useState(false);

    function clearAll() {
        setProcessing(true);
        router.delete(metaEvents.destroyAll().url, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setConfirmingClear(false);
            },
        });
    }

    return (
        <>
            <Head title="Meta Event Log" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Meta Event Log"
                    description="Every Purchase event sent to Facebook's Conversions API, and whether Meta accepted it."
                />
                {logs.data.length > 0 && (
                    <Button
                        variant="destructive"
                        onClick={() => setConfirmingClear(true)}
                        className="w-full sm:w-auto"
                    >
                        Delete all
                    </Button>
                )}
            </div>

            {logs.data.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No events logged yet. Events appear here once an order is
                    placed with a Facebook Pixel ID and Conversions API access
                    token configured on the Settings page.
                </p>
            )}

            {logs.data.length > 0 && (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>HTTP</TableHead>
                                <TableHead>Event ID</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">
                                        {log.order_id && log.order_number ? (
                                            <a
                                                href={
                                                    orders.show(log.order_id)
                                                        .url
                                                }
                                                className="underline-offset-2 hover:underline"
                                            >
                                                {log.order_number}
                                            </a>
                                        ) : (
                                            (log.order_number ?? '—')
                                        )}
                                    </TableCell>
                                    <TableCell>{log.event_name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                log.status === 'success'
                                                    ? 'outline'
                                                    : 'destructive'
                                            }
                                            className={
                                                log.status === 'success'
                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                                                    : undefined
                                            }
                                        >
                                            {log.status_label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {log.http_status ?? '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {log.event_id ?? '—'}
                                    </TableCell>
                                    <TableCell
                                        className="max-w-[320px] truncate"
                                        title={log.message ?? undefined}
                                    >
                                        {log.message ?? '—'}
                                    </TableCell>
                                    <TableCell>
                                        {log.created_at
                                            ? new Date(
                                                  log.created_at,
                                              ).toLocaleString()
                                            : '—'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Pagination links={logs.links} />

            <ConfirmDialog
                open={confirmingClear}
                onOpenChange={(open) => !processing && setConfirmingClear(open)}
                title="Delete all event logs?"
                description={`All ${logs.total} logged event${logs.total === 1 ? '' : 's'} will be permanently deleted. This cannot be undone.`}
                confirmLabel="Delete all"
                processing={processing}
                onConfirm={clearAll}
            />
        </>
    );
}

MetaEventLogIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Meta Event Log', href: metaEvents.index() },
    ],
};
