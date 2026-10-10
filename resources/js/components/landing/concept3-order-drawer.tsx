import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Truck, X } from 'lucide-react';
import InputError from '@/components/input-error';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import { toEnglishDigits } from '@/lib/bangla-digits';
import { shippingAreaLabel } from '@/lib/shipping-area';
import QuantityStepper from './quantity-stepper';

const fieldClass =
    'w-full rounded-md border border-amber-200 px-3 py-3 font-bengali text-base focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 focus:outline-none';

/**
 * Concept 3's cart/checkout drawer - a right-side slide-in panel (matching
 * the design's `.overlay`/`.drawer`), built on the same Radix Dialog
 * primitives `ProductImageViewer` uses for its own non-standard dialog
 * shape, rather than shadcn's centered `DialogContent`.
 *
 * The original static mockup had a two-step "cart summary, then form"
 * flow with fake submission - this always shows the real form (quantity
 * through submit) in one step and posts a real order via `useCheckoutForm`,
 * since there's no persistent multi-item cart to summarize first.
 */
export default function Concept3OrderDrawer({
    open,
    onOpenChange,
    productName,
    checkout,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    checkout: CheckoutForm;
}) {
    const {
        data,
        setField,
        displayShippingAreas,
        subtotal,
        shippingCharge,
        grandTotal,
        errors,
        processing,
        submit,
    } = checkout;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white p-6 font-bengali shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right sm:p-7">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-5">
                        <DialogPrimitive.Title className="text-xl font-bold text-stone-900">
                            আপনার অর্ডার
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close
                            aria-label="বন্ধ করুন"
                            className="text-stone-500 transition hover:text-stone-900"
                        >
                            <X className="size-6" />
                        </DialogPrimitive.Close>
                    </div>

                    <form onSubmit={submit} className="space-y-5 pt-5">
                        <div
                            className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                            aria-hidden="true"
                        >
                            <input
                                type="text"
                                name="hp_confirm_entry"
                                value={data.website}
                                onChange={(e) =>
                                    checkout.setHoneypot(e.target.value)
                                }
                                tabIndex={-1}
                                autoComplete="off"
                                readOnly
                            />
                        </div>

                        <p className="text-sm text-stone-500">{productName}</p>

                        <div className="grid gap-2">
                            <label
                                htmlFor="drawer_quantity"
                                className="font-semibold text-stone-700"
                            >
                                বোতলের সংখ্যা
                            </label>
                            <QuantityStepper
                                value={data.quantity}
                                onChange={(value) =>
                                    setField('quantity', value)
                                }
                            />
                            <InputError message={errors.quantity} />
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="drawer_name"
                                className="font-semibold text-stone-700"
                            >
                                আপনার নাম কী?
                            </label>
                            <input
                                id="drawer_name"
                                value={data.customer_name}
                                onChange={(e) =>
                                    setField('customer_name', e.target.value)
                                }
                                placeholder="আপনার নাম লিখুন"
                                maxLength={60}
                                pattern="[\p{Script=Bengali}\p{Script=Latin} .\-]+"
                                required
                                className={fieldClass}
                            />
                            <InputError message={errors.customer_name} />
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="drawer_phone"
                                className="font-semibold text-stone-700"
                            >
                                যোগাযোগের মোবাইল নম্বর
                            </label>
                            <input
                                id="drawer_phone"
                                type="tel"
                                inputMode="numeric"
                                pattern="01[3-9][0-9]{8}"
                                value={data.customer_phone}
                                onChange={(e) =>
                                    setField(
                                        'customer_phone',
                                        toEnglishDigits(e.target.value),
                                    )
                                }
                                placeholder="01XXXXXXXXX"
                                required
                                className={fieldClass}
                            />
                            <InputError message={errors.customer_phone} />
                        </div>

                        <div className="grid gap-2">
                            <label
                                htmlFor="drawer_address"
                                className="font-semibold text-stone-700"
                            >
                                কোথায় পৌঁছে দেব?
                            </label>
                            <input
                                id="drawer_address"
                                value={data.delivery_address}
                                onChange={(e) =>
                                    setField('delivery_address', e.target.value)
                                }
                                required
                                minLength={10}
                                maxLength={200}
                                className={fieldClass}
                            />
                            <InputError message={errors.delivery_address} />
                        </div>

                        <fieldset className="grid grid-cols-2 gap-2.5">
                            <legend className="mb-2.5 w-full font-semibold text-stone-700">
                                কোথায় ডেলিভারি নেবেন?
                            </legend>
                            {displayShippingAreas.map((area) => {
                                const checked =
                                    data.shipping_area_id === area.id;

                                return (
                                    <label
                                        key={area.id}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-3 text-sm transition-colors ${
                                            checked
                                                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-400/50'
                                                : 'border-amber-200 hover:border-amber-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="drawer_shipping_area_id"
                                            checked={checked}
                                            onChange={() =>
                                                setField(
                                                    'shipping_area_id',
                                                    area.id,
                                                )
                                            }
                                            className="size-[18px] accent-amber-600"
                                        />
                                        <span>
                                            {shippingAreaLabel(area.name)}
                                            <strong className="mt-0.5 block text-stone-900">
                                                ৳{area.charge}
                                            </strong>
                                        </span>
                                    </label>
                                );
                            })}
                        </fieldset>
                        <InputError message={errors.shipping_area_id} />

                        <div className="space-y-3 rounded-2xl border border-stone-800 bg-stone-950 p-5 text-white shadow-lg">
                            <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                                <span>পণ্যের মূল্য</span>
                                <span>৳{subtotal.toFixed(0)}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                                <span>ডেলিভারি</span>
                                <span>৳{shippingCharge.toFixed(0)}</span>
                            </div>
                            <div className="flex items-center justify-between pt-1 text-base font-bold text-amber-400">
                                <span>সর্বমোট</span>
                                <span className="text-xl font-extrabold">
                                    ৳{grandTotal.toFixed(0)}
                                </span>
                            </div>

                            <InputError message={errors.order} />

                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] py-3.5 text-base font-bold text-stone-950 shadow-xl transition-[background-position] duration-1000 hover:bg-right disabled:opacity-60"
                            >
                                {processing
                                    ? 'অর্ডার হচ্ছে...'
                                    : 'অর্ডার কনফার্ম করুন →'}
                            </button>

                            <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-neutral-400">
                                <Truck className="size-3.5 text-emerald-400" />
                                ক্যাশ অন ডেলিভারি — হাতে পেয়ে মূল্য পরিশোধ করুন
                            </p>
                        </div>
                    </form>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
