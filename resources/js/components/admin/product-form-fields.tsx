import { useState } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
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

export type ProductFormValues = {
    name: string;
    slug: string;
    sku: string;
    short_description: string | null;
    description: string | null;
    regular_price: string;
    sale_price: string | null;
    track_stock: boolean;
    stock: number;
    weight: string;
    free_delivery: boolean;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    sort_order: number;
};

export function ProductFormFields({
    defaults,
    errors,
    canSetVisibility,
}: {
    defaults: ProductFormValues;
    errors: Partial<Record<string, string>>;
    canSetVisibility: boolean;
}) {
    const [freeDelivery, setFreeDelivery] = useState(defaults.free_delivery);

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={defaults.name}
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            name="slug"
                            defaultValue={defaults.slug}
                            required
                        />
                        <InputError message={errors.slug} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            name="sku"
                            defaultValue={defaults.sku}
                            required
                        />
                        <InputError message={errors.sku} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="short_description">Short description</Label>
                    <Textarea
                        id="short_description"
                        name="short_description"
                        defaultValue={defaults.short_description ?? ''}
                        rows={2}
                    />
                    <InputError message={errors.short_description} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={defaults.description ?? ''}
                        rows={6}
                    />
                    <InputError message={errors.description} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="regular_price">Regular price</Label>
                        <Input
                            id="regular_price"
                            name="regular_price"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={defaults.regular_price}
                            required
                        />
                        <InputError message={errors.regular_price} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sale_price">Sale price</Label>
                        <Input
                            id="sale_price"
                            name="sale_price"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={defaults.sale_price ?? ''}
                        />
                        <InputError message={errors.sale_price} />
                    </div>
                </div>

                <fieldset className="grid gap-4 rounded-lg border p-4">
                    <legend className="px-1 text-sm font-medium">SEO</legend>
                    <div className="grid gap-2">
                        <Label htmlFor="meta_title">Meta title</Label>
                        <Input
                            id="meta_title"
                            name="meta_title"
                            defaultValue={defaults.meta_title ?? ''}
                        />
                        <InputError message={errors.meta_title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="meta_description">
                            Meta description
                        </Label>
                        <Textarea
                            id="meta_description"
                            name="meta_description"
                            defaultValue={defaults.meta_description ?? ''}
                            rows={2}
                        />
                        <InputError message={errors.meta_description} />
                    </div>
                </fieldset>
            </div>

            <div className="space-y-6">
                <fieldset className="grid gap-4 rounded-lg border p-4">
                    <legend className="px-1 text-sm font-medium">Status</legend>
                    <div className="grid gap-2">
                        <Label htmlFor="is_active">Visibility</Label>
                        <Select
                            name="is_active"
                            defaultValue={
                                canSetVisibility
                                    ? defaults.is_active
                                        ? '1'
                                        : '0'
                                    : '1'
                            }
                            disabled={!canSetVisibility}
                        >
                            <SelectTrigger id="is_active" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {!canSetVisibility && (
                            <p className="text-xs text-muted-foreground">
                                This is the only product in your catalog, so it
                                must stay active.
                            </p>
                        )}
                        <InputError message={errors.is_active} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="sort_order">Sort order</Label>
                        <Input
                            id="sort_order"
                            name="sort_order"
                            type="number"
                            min="0"
                            defaultValue={defaults.sort_order}
                        />
                        <InputError message={errors.sort_order} />
                    </div>
                </fieldset>

                <fieldset className="grid gap-4 rounded-lg border p-4">
                    <legend className="px-1 text-sm font-medium">Stock</legend>
                    <div className="grid gap-2">
                        <Label htmlFor="track_stock">Track stock</Label>
                        <Select
                            name="track_stock"
                            defaultValue={defaults.track_stock ? '1' : '0'}
                        >
                            <SelectTrigger id="track_stock" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Yes</SelectItem>
                                <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Ignored once this product has sizes/variants - each
                            variant tracks its own stock.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Stock quantity</Label>
                        <Input
                            id="stock"
                            name="stock"
                            type="number"
                            min="0"
                            defaultValue={defaults.stock}
                        />
                        <InputError message={errors.stock} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                            id="weight"
                            name="weight"
                            type="number"
                            step="0.01"
                            min="0.05"
                            defaultValue={defaults.weight}
                        />
                        <p className="text-xs text-muted-foreground">
                            Used to calculate courier delivery weight.
                        </p>
                        <InputError message={errors.weight} />
                    </div>
                </fieldset>

                <fieldset className="grid gap-4 rounded-lg border p-4">
                    <legend className="px-1 text-sm font-medium">
                        Delivery
                    </legend>
                    <div className="flex items-center space-x-3">
                        <input
                            type="hidden"
                            name="free_delivery"
                            value={freeDelivery ? '1' : '0'}
                        />
                        <Checkbox
                            id="free_delivery"
                            checked={freeDelivery}
                            onCheckedChange={(checked) =>
                                setFreeDelivery(checked === true)
                            }
                        />
                        <Label htmlFor="free_delivery">Free delivery</Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        When checked, the delivery/shipping charge is waived for
                        this product - customers pay ৳0.00 for shipping
                        regardless of the selected area.
                    </p>
                    <InputError message={errors.free_delivery} />
                </fieldset>
            </div>
        </div>
    );
}
