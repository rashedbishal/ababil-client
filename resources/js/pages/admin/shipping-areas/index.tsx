import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes/admin';
import shippingAreas from '@/routes/admin/shipping-areas';

type ShippingArea = {
    id: number;
    name: string;
    charge: string;
    is_active: boolean;
    sort_order: number;
};

function ShippingAreaCard({ area }: { area: ShippingArea }) {
    const form = useForm({
        name: area.name,
        charge: area.charge,
        is_active: area.is_active,
        sort_order: area.sort_order,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.patch(shippingAreas.update(area.id).url, { preserveScroll: true });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{area.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="flex items-end gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor={`charge-${area.id}`}>
                            Delivery charge (৳)
                        </Label>
                        <input
                            id={`charge-${area.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.charge}
                            onChange={(e) =>
                                form.setData('charge', e.target.value)
                            }
                            className="h-9 w-32 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                        />
                        <InputError message={form.errors.charge} />
                    </div>
                    <Button type="submit" disabled={form.processing}>
                        Save
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ShippingAreasIndex({
    shippingAreas: areas,
}: {
    shippingAreas: ShippingArea[];
}) {
    return (
        <>
            <Head title="Shipping Charges" />

            <Heading
                title="Shipping Charges"
                description="Set the delivery charge customers pay for each shipping area at checkout."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-xl">
                {areas.map((area) => (
                    <ShippingAreaCard key={area.id} area={area} />
                ))}
            </div>
        </>
    );
}

ShippingAreasIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Shipping Charges', href: shippingAreas.index() },
    ],
};
