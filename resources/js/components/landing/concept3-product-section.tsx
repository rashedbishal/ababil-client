import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import { shippingAreaLabel } from '@/lib/shipping-area';
import OrderTriggerButton from './order-trigger-button';
import QuantityStepper from './quantity-stepper';

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

const AUTO_SLIDE_MS = 2500;

/**
 * Concept 3's product section: the quantity stepper and delivery-area
 * (inside/outside Dhaka) picker live on the page itself, before the
 * "অর্ডার করুন" button - the order drawer (`Concept3OrderDrawer`) only
 * collects name/phone/address, since both already have a value by the
 * time it opens.
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

    const { data, setField, displayShippingAreas, errors } = checkout;

    useEffect(() => {
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
            <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-8 sm:py-14">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
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
                                    <motion.img
                                        key={active.id}
                                        src={active.src}
                                        alt={active.alt}
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.4 }}
                                        className="relative size-full rounded-3xl object-cover"
                                    />
                                )}
                            </AnimatePresence>
                        </button>

                        <div className="mt-4 grid grid-cols-4 gap-3">
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
                                        className="size-full rounded-2xl object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col justify-center pt-3">
                        <h1 className="font-bengali text-5xl font-black tracking-tight text-stone-900 sm:text-6xl">
                            {productName}
                        </h1>

                        <div className="mt-6 grid gap-2">
                            <span className="font-bengali font-semibold text-stone-700">
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

                        <fieldset className="mt-5 grid grid-cols-2 gap-2.5">
                            <legend className="mb-2.5 w-full font-bengali font-semibold text-stone-700">
                                কোথায় ডেলিভারি নেবেন?
                            </legend>
                            {displayShippingAreas.map((area) => {
                                const checked =
                                    data.shipping_area_id === area.id;

                                return (
                                    <label
                                        key={area.id}
                                        className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-3 font-bengali text-sm transition-colors ${
                                            checked
                                                ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-400/50'
                                                : 'border-amber-200 hover:border-amber-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="product_shipping_area_id"
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

                        <div className="mt-6">
                            <OrderTriggerButton
                                onClick={onOrderClick}
                                size="xl"
                                className="w-full max-w-[360px] justify-center"
                            >
                                অর্ডার করুন
                            </OrderTriggerButton>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col divide-y divide-amber-100 border-t border-b border-amber-100 sm:mt-10 sm:flex-row sm:divide-x sm:divide-y-0">
                    {trustItems.map(({ icon: Icon, title, subtitle }) => (
                        <div
                            key={title}
                            className="grid grid-cols-[42px_1fr] items-center gap-3.5 px-1 py-4 sm:flex-1 sm:flex-col sm:items-center sm:gap-2 sm:py-6 sm:text-center"
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
