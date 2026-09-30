import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
    blockedIps: list,
}: {
    blockedIps: BlockedIp[];
}) {
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Blocked at</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No IPs blocked.
                            </TableCell>
                        </TableRow>
                    )}
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
                                    ? new Date(item.blocked_at).toLocaleString()
                                    : '—'}
                            </TableCell>
                            <TableCell>
                                {item.expires_at
                                    ? new Date(item.expires_at).toLocaleString()
                                    : 'Never'}
                            </TableCell>
                            <TableCell>
                                {item.is_currently_blocking ? (
                                    <Badge variant="destructive">
                                        Blocking
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
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
                            <select
                                id="ip-status"
                                value={form.data.is_active ? '1' : '0'}
                                onChange={(e) =>
                                    form.setData(
                                        'is_active',
                                        e.target.value === '1',
                                    )
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                            >
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
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
