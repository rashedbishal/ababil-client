import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import { sanitizePhoneInput } from '@/lib/bangla-digits';
import { shippingAreaLabel } from '@/lib/shipping-area';
import QuantityStepper from './quantity-stepper';

const fieldClass =
    'w-full rounded-md border border-amber-200 px-3 py-3 font-bengali text-base lg:py-2.5 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 focus:outline-none';

const trustItems = [
    {
        icon: Leaf,
        title: 'প্রাকৃতিক উপাদান',
        subtitle: 'প্রকৃতি থেকে দৈনন্দিন যত্ন',
    },
    {
        icon: Truck,
        title: 'সারা দেশে ডেলিভারি',
        subtitle: 'আপনার দরজায় পৌঁছে যাবে',
    },
    {
        icon: ShieldCheck,
        title: 'ক্যাশ অন ডেলিভারি',
        subtitle: 'হাতে পেয়ে মূল্য পরিশোধ',
    },
];

const AUTO_SLIDE_MS = 7000;

/**
 * Concept 3's product section, which is also where the order is placed: the
 * whole checkout (quantity, delivery area, name/phone/address, totals and the
 * confirm button) lives right here on the page - there is no order drawer.
 * Every other "অর্ডার করুন" button on the page just scrolls to `#order-form`
 * below (see `pages/concept-3.tsx`). The success/failure result is shown in
 * `OrderResultDialog`, not here.
 */
export default function Concept3ProductSection({
    productName,
    images,
    checkout,
    onOrderClick,
}: {
    productName: string;
    images: { id: string | number; src: string; alt: string }[];
    checkout: CheckoutForm;
    onOrderClick: () => void;
}) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const active = images[index];

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

    useEffect(() => {
        if (images.length < 2) {
            return;
        }

        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % images.length);
        }, AUTO_SLIDE_MS);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [images.length]);

    return (
        <section
            id="product"
            className="scroll-mt-24 bg-gradient-to-b from-amber-50 via-white to-amber-50"
        >
            <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-8 sm:py-14 lg:py-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,520px)] lg:items-center lg:justify-center lg:gap-20">
                    <div>
                        <button
                            type="button"
                            onClick={onOrderClick}
                            aria-label={`${productName} — অর্ডার করুন`}
                            className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-stone-950 shadow-2xl shadow-amber-900/20"
                        >
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_70%)]"
                            />

                            <AnimatePresence mode="wait">
                                {active && (
                                    <m.img
                                        key={active.id}
                                        src={active.src}
                                        alt={active.alt}
                                        loading="lazy"
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative size-full rounded-3xl object-cover"
                                    />
                                )}
                            </AnimatePresence>
                        </button>

                        {images.length > 1 && (
                            <div className="mt-4 grid grid-cols-4 gap-3 lg:mt-3 lg:gap-2.5">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() => setIndex(i)}
                                        aria-label={`${img.alt} দেখুন`}
                                        aria-pressed={i === index}
                                        className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 transition-all duration-300 ${
                                            i === index
                                                ? 'scale-105 border-amber-500 shadow-md ring-2 ring-amber-400/50'
                                                : 'border-amber-200 opacity-75 hover:border-amber-400 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            loading="lazy"
                                            className="size-full rounded-2xl object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center pt-3 lg:pt-0">
                        <h1 className="font-bengali text-5xl font-black tracking-tight text-stone-900 sm:text-6xl lg:text-4xl">
                            {productName}
                        </h1>

                        <div id="order-form" className="scroll-mt-24">
                            <form onSubmit={submit}>
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

                                <div className="mt-5 grid w-full grid-cols-[96px_minmax(0,1fr)] gap-2.5 sm:gap-3 lg:mt-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start lg:gap-6">
                                    <div className="grid gap-2 lg:mt-0">
                                        <span className="font-bengali text-sm font-semibold text-stone-700 sm:text-base">
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

                                    <div>
                                        <fieldset className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:mt-0">
                                            <legend className="col-span-2 mb-2 w-full font-bengali text-sm font-semibold text-stone-700 sm:text-base">
                                                কোথায় ডেলিভারি নেবেন?
                                            </legend>
                                            {displayShippingAreas.map(
                                                (area) => {
                                                    const checked =
                                                        data.shipping_area_id ===
                                                        area.id;

                                                    return (
                                                        <label
                                                            key={area.id}
                                                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2 py-2.5 font-bengali text-[11px] leading-tight transition-colors sm:text-xs lg:py-1.5 ${
                                                                checked
                                                                    ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-400/50'
                                                                    : 'border-amber-200 hover:border-amber-300'
                                                            }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="product_shipping_area_id"
                                                                checked={
                                                                    checked
                                                                }
                                                                onChange={() =>
                                                                    setField(
                                                                        'shipping_area_id',
                                                                        area.id,
                                                                    )
                                                                }
                                                                className="size-[15px] shrink-0 accent-amber-600"
                                                            />
                                                            <span className="min-w-0">
                                                                {shippingAreaLabel(
                                                                    area.name,
                                                                )}
                                                                <strong className="mt-0.5 block text-stone-900">
                                                                    ৳
                                                                    {
                                                                        area.charge
                                                                    }
                                                                </strong>
                                                            </span>
                                                        </label>
                                                    );
                                                },
                                            )}
                                        </fieldset>
                                        <InputError
                                            message={errors.shipping_area_id}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid w-full grid-cols-2 gap-2.5 sm:gap-3 lg:mt-3 lg:gap-4">
                                    <div className="grid gap-1.5 lg:mt-0">
                                        <label
                                            htmlFor="checkout_name"
                                            className="flex h-[20px] items-center font-bengali text-sm font-semibold text-stone-700 sm:text-base"
                                        >
                                            আপনার নাম কী?
                                        </label>
                                        <input
                                            id="checkout_name"
                                            value={data.customer_name}
                                            onChange={(e) =>
                                                setField(
                                                    'customer_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="আপনার নাম লিখুন"
                                            maxLength={60}
                                            pattern="[\p{Script=Bengali}\p{Script=Latin} .\-]+"
                                            required
                                            className={`${fieldClass} h-[42px]`}
                                        />
                                        <InputError
                                            message={errors.customer_name}
                                        />
                                    </div>

                                    <div className="grid gap-1.5 lg:mt-0">
                                        <label
                                            htmlFor="checkout_phone"
                                            className="flex h-[20px] items-center font-bengali text-sm font-semibold text-stone-700 sm:text-base"
                                        >
                                            যোগাযোগের মোবাইল নম্বর
                                        </label>
                                        <input
                                            id="checkout_phone"
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="01[3-9][0-9]{8}"
                                            value={data.customer_phone}
                                            onChange={(e) =>
                                                setField(
                                                    'customer_phone',
                                                    sanitizePhoneInput(
                                                        e.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="01XXXXXXXXX"
                                            required
                                            className={`${fieldClass} h-[42px]`}
                                        />
                                        <InputError
                                            message={errors.customer_phone}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-2 lg:mt-3">
                                    <label
                                        htmlFor="checkout_address"
                                        className="font-bengali font-semibold text-stone-700"
                                    >
                                        ঠিকানা
                                    </label>
                                    <input
                                        id="checkout_address"
                                        value={data.delivery_address}
                                        onChange={(e) =>
                                            setField(
                                                'delivery_address',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        placeholder="বাড়ি, রাস্তা, এলাকা ও থানা সহ সম্পূর্ণ ঠিকানা লিখুন"
                                        minLength={10}
                                        maxLength={200}
                                        className={fieldClass}
                                    />
                                    <InputError
                                        message={errors.delivery_address}
                                    />
                                </div>

                                <div className="mt-6 space-y-3 rounded-2xl border border-stone-800 bg-stone-950 p-5 font-bengali text-white shadow-lg lg:mt-3 lg:space-y-1.5 lg:p-3.5">
                                    <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300 lg:pb-1.5">
                                        <span>পণ্যের মূল্য</span>
                                        <span>৳{subtotal.toFixed(0)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300 lg:pb-1.5">
                                        <span>ডেলিভারি</span>
                                        <span>
                                            ৳{shippingCharge.toFixed(0)}
                                        </span>
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
                                        className="mt-2 w-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] py-3.5 text-base font-bold text-stone-950 shadow-xl transition-[background-position] duration-1000 hover:bg-right disabled:opacity-60 lg:mt-1 lg:py-2.5"
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
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col divide-y divide-amber-100 border-t border-b border-amber-100 sm:mt-10 sm:flex-row sm:divide-x sm:divide-y-0 lg:mt-6">
                    {trustItems.map(({ icon: Icon, title, subtitle }) => (
                        <div
                            key={title}
                            className="grid grid-cols-[42px_1fr] items-center gap-3.5 px-1 py-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:py-6 sm:text-center lg:py-4"
                        >
                            <span className="grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-amber-100 text-amber-700">
                                <Icon className="size-6" />
                            </span>
                            <div>
                                <b className="block font-bengali text-base font-bold text-stone-900">
                                    {title}
                                </b>
                                <small className="mt-0.5 block font-bengali text-sm text-stone-500">
                                    {subtitle}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
