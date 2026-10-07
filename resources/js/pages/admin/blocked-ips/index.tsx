import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import blockedIps from '@/routes/admin/blocked-ips';
import type { Paginated } from '@/types';

type BlockedIp = {
    id: number;
    ip_address: string;
    reason: string | null;
    blocked_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    is_currently_blocking: boolean;
};

type FormValues = {
    ip_address: string;
    reason: string;
    expires_at: string;
    is_active: boolean;
};

const emptyForm: FormValues = {
    ip_address: '',
    reason: '',
    expires_at: '',
    is_active: true,
};

export default function BlockedIpsIndex({
    blockedIps: paginated,
}: {
    blockedIps: Paginated<BlockedIp>;
}) {
    const list = paginated.data;
    const [editing, setEditing] = useState<BlockedIp | 'new' | null>(null);
    const form = useForm<FormValues>(emptyForm);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(item: BlockedIp) {
        form.setData({
            ip_address: item.ip_address,
            reason: item.reason ?? '',
            expires_at: item.expires_at ? item.expires_at.slice(0, 16) : '',
            is_active: item.is_active,
        });
        form.clearErrors();
        setEditing(item);
    }

    function submit() {
        if (editing === 'new') {
            form.post(blockedIps.store().url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.patch(blockedIps.update(editing.id).url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        }
    }

    function remove(item: BlockedIp) {
        if (confirm(`Unblock IP "${item.ip_address}"?`)) {
            router.delete(blockedIps.destroy(item.id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Blocked IPs" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Blocked IPs"
                    description="Block abusive IP addresses from placing orders. Never affects admin access."
                />
                <Button onClick={openCreate}>Block an IP</Button>
            </div>

            {list.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No IPs blocked.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {list.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-2">
                            <span className="font-mono text-sm font-medium">
                                {item.ip_address}
                            </span>
                            {item.is_currently_blocking ? (
                                <Badge variant="destructive">Blocking</Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                        {item.reason && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {item.reason}
                            </p>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">
                            Blocked:{' '}
                            {item.blocked_at
                                ? new Date(item.blocked_at).toLocaleString()
                                : '—'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Expires:{' '}
                            {item.expires_at
                                ? new Date(item.expires_at).toLocaleString()
                                : 'Never'}
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(item)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(item)}
                            >
                                Unblock
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Blocked at</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-mono text-sm">
                                    {item.ip_address}
                                </TableCell>
                                <TableCell className="max-w-xs truncate">
                                    {item.reason ?? '—'}
                                </TableCell>
                                <TableCell>
                                    {item.blocked_at
                                        ? new Date(
                                              item.blocked_at,
                                          ).toLocaleString()
                                        : '—'}
                                </TableCell>
                                <TableCell>
                                    {item.expires_at
                                        ? new Date(
                                              item.expires_at,
                                          ).toLocaleString()
                                        : 'Never'}
                                </TableCell>
                                <TableCell>
                                    {item.is_currently_blocking ? (
                                        <Badge variant="destructive">
                                            Blocking
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEdit(item)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => remove(item)}
                                        >
                                            Unblock
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Pagination links={paginated.links} />

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing === 'new'
                                ? 'Block an IP address'
                                : 'Edit blocked IP'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ip-address">IP address</Label>
                            <Input
                                id="ip-address"
                                placeholder="203.0.113.5 or 2001:db8::1"
                                value={form.data.ip_address}
                                onChange={(e) =>
                                    form.setData('ip_address', e.target.value)
                                }
                            />
                            <InputError message={form.errors.ip_address} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ip-reason">Reason</Label>
                            <Textarea
                                id="ip-reason"
                                rows={2}
                                value={form.data.reason}
                                onChange={(e) =>
                                    form.setData('reason', e.target.value)
                                }
                            />
                            <InputError message={form.errors.reason} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ip-expires">
                                Expires at (optional)
                            </Label>
                            <Input
                                id="ip-expires"
                                type="datetime-local"
                                value={form.data.expires_at}
                                onChange={(e) =>
                                    form.setData('expires_at', e.target.value)
                                }
                            />
                            <InputError message={form.errors.expires_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="ip-status">Status</Label>
                            <Select
                                value={form.data.is_active ? '1' : '0'}
                                onValueChange={(value) =>
                                    form.setData('is_active', value === '1')
                                }
                            >
                                <SelectTrigger
                                    id="ip-status"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditing(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={submit}
                            disabled={form.processing}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

BlockedIpsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Blocked IPs', href: blockedIps.index() },
    ],
};
