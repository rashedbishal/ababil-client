import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
import products from '@/routes/admin/products';

export type Variant = {
    id: number;
    size_id: number | null;
    size_name: string | null;
    sku: string;
    price_override: string | null;
    stock: number;
    is_active: boolean;
};

type FormValues = {
    size_id: string;
    sku: string;
    price_override: string;
    stock: string;
    is_active: boolean;
};

const emptyForm: FormValues = {
    size_id: '',
    sku: '',
    price_override: '',
    stock: '0',
    is_active: true,
};

export function VariantsManager({
    productId,
    variants,
    sizes,
}: {
    productId: number;
    variants: Variant[];
    sizes: { id: number; name: string }[];
}) {
    const [editing, setEditing] = useState<Variant | 'new' | null>(null);
    const form = useForm<FormValues>(emptyForm);

    function openCreate() {
        form.reset();
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(variant: Variant) {
        form.setData({
            size_id: variant.size_id ? String(variant.size_id) : '',
            sku: variant.sku,
            price_override: variant.price_override ?? '',
            stock: String(variant.stock),
            is_active: variant.is_active,
        });
        form.clearErrors();
        setEditing(variant);
    }

    function submit() {
        if (editing === 'new') {
            form.post(products.variants.store(productId).url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.patch(
                products.variants.update({
                    product: productId,
                    variant: editing.id,
                }).url,
                {
                    preserveScroll: true,
                    onSuccess: () => setEditing(null),
                },
            );
        }
    }

    function remove(variant: Variant) {
        if (confirm(`Remove size "${variant.size_name ?? variant.sku}"?`)) {
            router.delete(
                products.variants.destroy({
                    product: productId,
                    variant: variant.id,
                }).url,
                { preserveScroll: true },
            );
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Sizes / Variants</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCreate}
                >
                    Add size
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Size</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price override</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {variants.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="text-center text-muted-foreground"
                            >
                                No sizes added. This product sells as a single
                                item.
                            </TableCell>
                        </TableRow>
                    )}
                    {variants.map((variant) => (
                        <TableRow key={variant.id}>
                            <TableCell>{variant.size_name ?? '—'}</TableCell>
                            <TableCell>{variant.sku}</TableCell>
                            <TableCell>
                                {variant.price_override
                                    ? `৳${variant.price_override}`
                                    : '—'}
                            </TableCell>
                            <TableCell>{variant.stock}</TableCell>
                            <TableCell>
                                {variant.is_active ? (
                                    <Badge>Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(variant)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(variant)}
                                    >
                                        Remove
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
                            <Label htmlFor="variant-size">Size</Label>
                            <select
                                id="variant-size"
                                value={form.data.size_id}
                                onChange={(e) =>
                                    form.setData('size_id', e.target.value)
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                            >
                                <option value="">No size</option>
                                {sizes.map((size) => (
                                    <option key={size.id} value={size.id}>
                                        {size.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.size_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="variant-sku">SKU</Label>
                            <Input
                                id="variant-sku"
                                value={form.data.sku}
                                onChange={(e) =>
                                    form.setData('sku', e.target.value)
                                }
                            />
                            <InputError message={form.errors.sku} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="variant-price">
                                    Price override
                                </Label>
                                <Input
                                    id="variant-price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.data.price_override}
                                    onChange={(e) =>
                                        form.setData(
                                            'price_override',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.price_override}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="variant-stock">Stock</Label>
                                <Input
                                    id="variant-stock"
                                    type="number"
                                    min="0"
                                    value={form.data.stock}
                                    onChange={(e) =>
                                        form.setData('stock', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.stock} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="variant-status">Status</Label>
                            <select
                                id="variant-status"
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
        </div>
    );
}
