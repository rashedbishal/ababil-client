import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Truck, X } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import { sanitizePhoneInput } from '@/lib/bangla-digits';
import { shippingAreaLabel } from '@/lib/shipping-area';
import QuantityStepper from './quantity-stepper';

const fieldClass =
    'w-full rounded-md border border-amber-200 px-3 py-3 font-bengali text-base focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 focus:outline-none';

type DrawerImage = { id: string | number; src: string; alt: string };

/**
 * Concept 3's cart/checkout drawer - a right-side slide-in panel (matching
 * the design's `.overlay`/`.drawer`), built on the same Radix Dialog
 * primitives `ProductImageViewer` uses for its own non-standard dialog
 * shape, rather than shadcn's centered `DialogContent`.
 *
 * Every "অর্ডার করুন" button on the page opens this drawer directly now,
 * so it carries its own (smaller) image preview, quantity stepper and
 * delivery-area picker in the same order as the page's payment section -
 * reading/writing the same `checkout` state, so a choice made on the page
 * before opening the drawer (or in the drawer itself) is reflected in both
 * places.
 */
export default function Concept3OrderDrawer({
    open,
    onOpenChange,
    productName,
    images,
    checkout,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    images: DrawerImage[];
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

    const [imageIndex, setImageIndex] = useState(0);
    const activeImage = images[imageIndex];

    return (
        // `modal={false}` skips Radix's body scroll-lock (`overflow: hidden`
        // / `position: fixed` on `<body>`). Facebook's in-app browser treats
        // that style change as a navigation and reloads the page, so the
        // drawer never appears and the shopper lands back at the top.
        <DialogPrimitive.Root
            open={open}
            onOpenChange={onOpenChange}
            modal={false}
        >
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className="fixed inset-0 z-50 overflow-hidden overscroll-none bg-stone-950/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
                    onClick={() => onOpenChange(false)}
                />
                <DialogPrimitive.Content
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-[440px] flex-col overflow-y-auto bg-white p-6 font-bengali shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right sm:p-7"
                >
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

                        {activeImage && (
                            <div className="flex gap-2">
                                <div className="relative aspect-square w-full max-w-[160px] overflow-hidden rounded-2xl border border-amber-200 shadow-md">
                                    <AnimatePresence mode="wait">
                                        <m.img
                                            key={activeImage.id}
                                            src={activeImage.src}
                                            alt={activeImage.alt}
                                            initial={{
                                                opacity: 0,
                                                scale: 0.94,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.94 }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute inset-0 size-full object-cover"
                                        />
                                    </AnimatePresence>
                                </div>

                                {images.length > 1 && (
                                    <div className="flex flex-col gap-1.5">
                                        {images.map((img, idx) => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() =>
                                                    setImageIndex(idx)
                                                }
                                                aria-label={`${img.alt} দেখুন`}
                                                aria-pressed={
                                                    idx === imageIndex
                                                }
                                                className={`flex size-9 items-center justify-center overflow-hidden rounded-lg border-2 transition-all ${
                                                    idx === imageIndex
                                                        ? 'border-amber-500 ring-1 ring-amber-400/50'
                                                        : 'border-amber-200 opacity-75 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={img.src}
                                                    alt={img.alt}
                                                    className="size-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <span className="font-semibold text-stone-700">
                                বোতলের সংখ্যা
                            </span>
                            <QuantityStepper
                                value={data.quantity}
                                onChange={(value) =>
                                    setField('quantity', value)
                                }
                            />
                            <InputError message={errors.quantity} />
                        </div>

                        <fieldset className="grid gap-2">
                            <legend className="mb-1 font-semibold text-stone-700">
                                কোথায় ডেলিভারি নেবেন?
                            </legend>
                            <div className="grid grid-cols-2 gap-2">
                                {displayShippingAreas.map((area) => {
                                    const checked =
                                        data.shipping_area_id === area.id;

                                    return (
                                        <label
                                            key={area.id}
                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2.5 text-sm transition-colors ${
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
                            </div>
                            <InputError message={errors.shipping_area_id} />
                        </fieldset>

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
                                        sanitizePhoneInput(e.target.value),
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
                                ঠিকানা
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
