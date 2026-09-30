import { Head, useForm, useHttp, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCheckoutSession } from '@/hooks/use-checkout-session';
import incompleteOrders from '@/routes/incomplete-orders';
import orders from '@/routes/orders';

type Variant = {
    id: number;
    size: string | null;
    stock: number;
    in_stock: boolean;
    price: string;
};

type Product = {
    id: number;
    name: string;
    short_description: string | null;
    description: string | null;
    regular_price: string;
    sale_price: string | null;
    sku: string;
    in_stock: boolean;
    featured_image_url: string | null;
    gallery_urls: string[];
    variants: Variant[];
};

type ShippingArea = {
    id: number;
    name: string;
    charge: string;
};

export default function Welcome({
    product,
    shippingAreas,
}: {
    product: Product | null;
    shippingAreas: ShippingArea[];
}) {
    const { name: siteName } = usePage<{ name: string }>().props;

    const form = useForm({
        product_id: product?.id ?? 0,
        variant_id: null as number | null,
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: shippingAreas[0]?.id ?? null,
        customer_note: '',
        session_token: '',
    });

    const sessionToken = useCheckoutSession();
    const tracker = useHttp({
        session_token: sessionToken,
        product_id: product?.id ?? null,
        variant_id: null as number | null,
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        shipping_area_id: shippingAreas[0]?.id ?? null,
    });
    const trackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    function track(partial: Partial<typeof tracker.data>) {
        tracker.setData((data) => ({ ...data, ...partial }));

        if (trackTimeout.current) {
            clearTimeout(trackTimeout.current);
        }

        trackTimeout.current = setTimeout(() => {
            void tracker.post(incompleteOrders.store().url);
        }, 2000);
    }

    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        product?.variants[0]?.id ?? null,
    );

    const selectedVariant =
        product?.variants.find((v) => v.id === selectedVariantId) ?? null;

    const unitPrice = useMemo(() => {
        if (!product) {
            return 0;
        }

        if (selectedVariant) {
            return Number(selectedVariant.price);
        }

        return Number(product.sale_price ?? product.regular_price);
    }, [product, selectedVariant]);

    const selectedShippingArea = shippingAreas.find(
        (a) => a.id === form.data.shipping_area_id,
    );
    const shippingCharge = selectedShippingArea
        ? Number(selectedShippingArea.charge)
        : 0;
    const subtotal = unitPrice * form.data.quantity;
    const grandTotal = subtotal + shippingCharge;

    function updateAndTrack(partial: Partial<typeof form.data>) {
        const next = { ...form.data, ...partial };
        form.setData(next);
        track({
            product_id: next.product_id,
            variant_id: selectedVariantId,
            quantity: next.quantity,
            customer_name: next.customer_name,
            customer_phone: next.customer_phone,
            delivery_address: next.delivery_address,
            shipping_area_id: next.shipping_area_id,
        });
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            variant_id: selectedVariantId,
            session_token: sessionToken,
        }));

        form.post(orders.store().url);
    }

    if (!product) {
        return (
            <>
                <Head title="Store" />
                <div className="flex min-h-screen items-center justify-center p-6 text-center">
                    <p className="text-muted-foreground">
                        No products are available right now. Please check back
                        soon.
                    </p>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={product.name} />

            <div className="min-h-screen bg-background text-foreground">
                <header className="border-b px-6 py-4">
                    <span className="text-lg font-semibold">{siteName}</span>
                </header>

                <main className="mx-auto grid max-w-5xl gap-8 p-6 lg:grid-cols-2">
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                            {product.featured_image_url ? (
                                <img
                                    src={product.featured_image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No image
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold">
                                {product.name}
                            </h1>
                            {product.short_description && (
                                <p className="mt-1 text-muted-foreground">
                                    {product.short_description}
                                </p>
                            )}
                            <div className="mt-2 flex items-baseline gap-2">
                                {product.sale_price ? (
                                    <>
                                        <span className="text-xl font-bold">
                                            ৳{product.sale_price}
                                        </span>
                                        <span className="text-muted-foreground line-through">
                                            ৳{product.regular_price}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-xl font-bold">
                                        ৳{product.regular_price}
                                    </span>
                                )}
                            </div>
                        </div>

                        {product.description && (
                            <p className="text-sm whitespace-pre-line text-muted-foreground">
                                {product.description}
                            </p>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        {product.variants.length > 0 && (
                            <div className="grid gap-2">
                                <Label>Size</Label>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((variant) => (
                                        <button
                                            type="button"
                                            key={variant.id}
                                            disabled={!variant.in_stock}
                                            onClick={() =>
                                                setSelectedVariantId(variant.id)
                                            }
                                            className={`rounded-md border px-3 py-1.5 text-sm ${
                                                selectedVariantId === variant.id
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-input'
                                            } ${!variant.in_stock ? 'cursor-not-allowed opacity-40' : ''}`}
                                        >
                                            {variant.size ?? '—'}
                                        </button>
                                    ))}
                                </div>
                                <InputError message={form.errors.variant_id} />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min={1}
                                max={50}
                                value={form.data.quantity}
                                onChange={(e) =>
                                    updateAndTrack({
                                        quantity: Number(e.target.value),
                                    })
                                }
                                className="w-24"
                            />
                            <InputError message={form.errors.quantity} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_name">Full name</Label>
                            <Input
                                id="customer_name"
                                value={form.data.customer_name}
                                onChange={(e) =>
                                    updateAndTrack({
                                        customer_name: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError message={form.errors.customer_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_phone">
                                Mobile number
                            </Label>
                            <Input
                                id="customer_phone"
                                value={form.data.customer_phone}
                                onChange={(e) =>
                                    updateAndTrack({
                                        customer_phone: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError message={form.errors.customer_phone} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="delivery_address">
                                Delivery address
                            </Label>
                            <Textarea
                                id="delivery_address"
                                rows={3}
                                value={form.data.delivery_address}
                                onChange={(e) =>
                                    updateAndTrack({
                                        delivery_address: e.target.value,
                                    })
                                }
                                required
                            />
                            <InputError
                                message={form.errors.delivery_address}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="shipping_area_id">
                                Shipping area
                            </Label>
                            <select
                                id="shipping_area_id"
                                value={form.data.shipping_area_id ?? ''}
                                onChange={(e) =>
                                    updateAndTrack({
                                        shipping_area_id: Number(
                                            e.target.value,
                                        ),
                                    })
                                }
                                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs"
                                required
                            >
                                {shippingAreas.map((area) => (
                                    <option key={area.id} value={area.id}>
                                        {area.name} (৳{area.charge})
                                    </option>
                                ))}
                            </select>
                            <InputError
                                message={form.errors.shipping_area_id}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="customer_note">
                                Order note (optional)
                            </Label>
                            <Textarea
                                id="customer_note"
                                rows={2}
                                value={form.data.customer_note}
                                onChange={(e) =>
                                    form.setData(
                                        'customer_note',
                                        e.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.customer_note} />
                        </div>

                        <div className="space-y-1 rounded-lg border p-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span>৳{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    Shipping
                                </span>
                                <span>৳{shippingCharge.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 text-base font-semibold">
                                <span>Grand total</span>
                                <span>৳{grandTotal.toFixed(2)}</span>
                            </div>
                            <p className="pt-1 text-xs text-muted-foreground">
                                Final total is confirmed by the store after you
                                place your order.
                            </p>
                        </div>

                        <InputError
                            message={
                                (form.errors as Record<string, string>).order
                            }
                        />

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={form.processing}
                        >
                            Place Order
                        </Button>
                    </form>
                </main>
            </div>
        </>
    );
}
