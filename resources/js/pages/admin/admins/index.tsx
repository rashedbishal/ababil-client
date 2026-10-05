import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination';
import PasswordInput from '@/components/password-input';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import admins from '@/routes/admin/admins';
import { dashboard } from '@/routes/admin';
import type { Paginated } from '@/types';

type AdminUser = {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
};

type FormValues = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

const emptyForm: FormValues = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

export default function AdminsIndex({
    admins: paginated,
    viewerId,
}: {
    admins: Paginated<AdminUser>;
    viewerId: number;
}) {
    const list = paginated.data;
    const [editing, setEditing] = useState<AdminUser | 'new' | null>(null);
    const form = useForm<FormValues>(emptyForm);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(item: AdminUser) {
        form.setData({
            name: item.name,
            email: item.email,
            password: '',
            password_confirmation: '',
        });
        form.clearErrors();
        setEditing(item);
    }

    function submit() {
        if (editing === 'new') {
            form.post(admins.store().url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.put(admins.update(editing.id).url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        }
    }

    function remove(item: AdminUser) {
        if (confirm(`Remove admin account "${item.name}" (${item.email})?`)) {
            router.delete(admins.destroy(item.id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Admin Management" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Admin Management"
                    description="Create and manage admin accounts, including your own password."
                />
                <Button onClick={openCreate}>Create admin</Button>
            </div>

            {list.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No admin accounts yet.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {list.map((item) => (
                    <div key={item.id} className="rounded-lg border p-4">
                        <p className="font-medium">
                            {item.name}
                            {item.id === viewerId && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                    (You)
                                </span>
                            )}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {item.email}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Created:{' '}
                            {item.created_at
                                ? new Date(item.created_at).toLocaleDateString()
                                : '—'}
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEdit(item)}
                            >
                                Edit
                            </Button>
                            {item.id !== viewerId && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => remove(item)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.name}
                                    {item.id === viewerId && (
                                        <span className="ml-2 text-xs text-muted-foreground">
                                            (You)
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{item.email}</TableCell>
                                <TableCell>
                                    {item.created_at
                                        ? new Date(
                                              item.created_at,
                                          ).toLocaleDateString()
                                        : '—'}
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
                                        {item.id !== viewerId && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => remove(item)}
                                            >
                                                Remove
                                            </Button>
                                        )}
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
                                ? 'Create an admin account'
                                : 'Edit admin account'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="admin-name">Name</Label>
                            <Input
                                id="admin-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-email">Email</Label>
                            <Input
                                id="admin-email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                            />
                            <InputError message={form.errors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-password">
                                {editing === 'new'
                                    ? 'Password'
                                    : 'New password (leave blank to keep current)'}
                            </Label>
                            <PasswordInput
                                id="admin-password"
                                value={form.data.password}
                                onChange={(e) =>
                                    form.setData('password', e.target.value)
                                }
                            />
                            <InputError message={form.errors.password} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin-password-confirmation">
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="admin-password-confirmation"
                                value={form.data.password_confirmation}
                                onChange={(e) =>
                                    form.setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                            />
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

AdminsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Admin Management', href: admins.index() },
    ],
};
