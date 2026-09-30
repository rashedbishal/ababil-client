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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import shippingAreas from '@/routes/admin/shipping-areas';

type ShippingArea = {
    id: number;
    name: string;
    charge: string;
    is_active: boolean;
    sort_order: number;
};

type FormValues = {
    name: string;
    charge: string;
    sort_order: string;
    is_active: boolean;
};

const emptyForm: FormValues = {
    name: '',
    charge: '',
    sort_order: '0',
    is_active: true,
};

export default function ShippingAreasIndex({
    shippingAreas: areas,
}: {
    shippingAreas: ShippingArea[];
}) {
    const [editing, setEditing] = useState<ShippingArea | 'new' | null>(null);
    const form = useForm<FormValues>(emptyForm);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(area: ShippingArea) {
        form.setData({
            name: area.name,
            charge: area.charge,
            sort_order: String(area.sort_order),
            is_active: area.is_active,
        });
        form.clearErrors();
        setEditing(area);
    }

    function submit() {
        if (editing === 'new') {
            form.post(shippingAreas.store().url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.patch(shippingAreas.update(editing.id).url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        }
    }

    function remove(area: ShippingArea) {
        if (confirm(`Delete shipping area "${area.name}"?`)) {
            router.delete(shippingAreas.destroy(area.id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Shipping Areas" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Shipping"
                    description="Configure the delivery areas customers can choose at checkout."
                />
                <Button onClick={openCreate}>Add area</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Charge</TableHead>
                        <TableHead>Sort order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {areas.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                No shipping areas yet.
                            </TableCell>
                        </TableRow>
                    )}
                    {areas.map((area) => (
                        <TableRow key={area.id}>
                            <TableCell className="font-medium">
                                {area.name}
                            </TableCell>
                            <TableCell>৳{area.charge}</TableCell>
                            <TableCell>{area.sort_order}</TableCell>
                            <TableCell>
                                {area.is_active ? (
                                    <Badge>Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(area)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(area)}
                                    >
                                        Delete
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
                                ? 'Add shipping area'
                                : 'Edit shipping area'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="area-name">Name</Label>
                            <Input
                                id="area-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="area-charge">Charge</Label>
                            <Input
                                id="area-charge"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.data.charge}
                                onChange={(e) =>
                                    form.setData('charge', e.target.value)
                                }
                            />
                            <InputError message={form.errors.charge} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="area-sort">Sort order</Label>
                            <Input
                                id="area-sort"
                                type="number"
                                min="0"
                                value={form.data.sort_order}
                                onChange={(e) =>
                                    form.setData('sort_order', e.target.value)
                                }
                            />
                            <InputError message={form.errors.sort_order} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="area-status">Status</Label>
                            <select
                                id="area-status"
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

ShippingAreasIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Shipping', href: shippingAreas.index() },
    ],
};
