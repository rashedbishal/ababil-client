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
import sizes from '@/routes/admin/sizes';

type Size = {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    is_active: boolean;
    variants_count: number;
};

type FormValues = {
    name: string;
    slug: string;
    sort_order: string;
    is_active: boolean;
};

const emptyForm: FormValues = {
    name: '',
    slug: '',
    sort_order: '0',
    is_active: true,
};

export default function SizesIndex({ sizes: sizeList }: { sizes: Size[] }) {
    const [editing, setEditing] = useState<Size | 'new' | null>(null);
    const form = useForm<FormValues>(emptyForm);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(size: Size) {
        form.setData({
            name: size.name,
            slug: size.slug,
            sort_order: String(size.sort_order),
            is_active: size.is_active,
        });
        form.clearErrors();
        setEditing(size);
    }

    function submit() {
        if (editing === 'new') {
            form.post(sizes.store().url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.patch(sizes.update(editing.id).url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        }
    }

    function remove(size: Size) {
        if (confirm(`Delete size "${size.name}"?`)) {
            router.delete(sizes.destroy(size.id).url, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Sizes" />

            <div className="flex items-center justify-between">
                <Heading
                    title="Sizes"
                    description="Manage the sizes products can be sold in."
                />
                <Button onClick={openCreate}>Add size</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Sort order</TableHead>
                        <TableHead>Variants</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sizeList.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No sizes yet.
                            </TableCell>
                        </TableRow>
                    )}
                    {sizeList.map((size) => (
                        <TableRow key={size.id}>
                            <TableCell className="font-medium">
                                {size.name}
                            </TableCell>
                            <TableCell>{size.slug}</TableCell>
                            <TableCell>{size.sort_order}</TableCell>
                            <TableCell>{size.variants_count}</TableCell>
                            <TableCell>
                                {size.is_active ? (
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
                                        onClick={() => openEdit(size)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(size)}
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
                            {editing === 'new' ? 'Add size' : 'Edit size'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="size-name">Name</Label>
                            <Input
                                id="size-name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="size-slug">Slug</Label>
                            <Input
                                id="size-slug"
                                value={form.data.slug}
                                onChange={(e) =>
                                    form.setData('slug', e.target.value)
                                }
                            />
                            <InputError message={form.errors.slug} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="size-sort">Sort order</Label>
                            <Input
                                id="size-sort"
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
                            <Label htmlFor="size-status">Status</Label>
                            <select
                                id="size-status"
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

SizesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Sizes', href: sizes.index() },
    ],
};
