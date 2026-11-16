import { router, usePage } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dismiss } from '@/routes/admin/courier/alert';

/**
 * One-time (per login, per outage) notice that the courier API is
 * unreachable. Visibility comes from the server's `courierHealth.alert`
 * shared prop; closing it tells the server so it isn't shown again until
 * the next login or the next outage.
 */
export function CourierUnreachableAlert() {
    const { courierHealth } = usePage().props;
    const [dismissedSince, setDismissedSince] = useState<string | null>(null);

    const open =
        courierHealth?.alert === true && courierHealth.since !== dismissedSince;

    function close() {
        if (!courierHealth?.since) {
            return;
        }

        setDismissedSince(courierHealth.since);
        router.post(
            dismiss().url,
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    const since = courierHealth?.since
        ? new Date(courierHealth.since).toLocaleString()
        : null;

    return (
        <Dialog open={open} onOpenChange={(next) => !next && close()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TriangleAlert className="size-5 text-amber-500" />
                        Courier service unreachable
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-2 text-sm">
                            <p>
                                The courier (Pathao) API is not responding
                                {since ? ` (since ${since})` : ''}. This is a
                                problem on the courier's side or with the
                                connection to it, not with your data.
                            </p>
                            <p>
                                Until it recovers,{' '}
                                <strong>Submit to courier</strong> is disabled
                                and order courier statuses show their last known
                                value. Everything else in the dashboard works as
                                normal.
                            </p>
                            <p>
                                The connection is re-checked every minute, and
                                courier features re-enable themselves
                                automatically once it's back.
                            </p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" onClick={close}>
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
