import { Sparkles, Star, Truck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toEnglishDigits } from '@/lib/bangla-digits';
import { shippingAreaLabel } from '@/lib/shipping-area';
import Reveal from './motion/reveal';
import QuantityStepper from './quantity-stepper';

import product1 from '../../../images/landing/product/product-1.webp';
import product2 from '../../../images/landing/product/product-2.webp';
import product3 from '../../../images/landing/product/product-3.webp';
import product4 from '../../../images/landing/product/product-4.webp';

const fieldClass =
    'border-amber-200 focus-visible:border-amber-400 focus-visible:ring-amber-400/30';

const galleryImages = [
    { id: 1, src: product1, alt: 'আবাবিল অয়েল ফ্রন্ট ভিউ' },
    { id: 2, src: product2, alt: 'আবাবিল অয়েল এঙ্গেল ভিউ' },
    { id: 3, src: product3, alt: 'আবাবিল অয়েল প্রফেশনাল ভিউ' },
    { id: 4, src: product4, alt: 'আবাবিল অয়েল প্যাক ভিউ' },
];

type ShippingArea = {
    id: number;
    name: string;
    charge: string;
};

export default function CheckoutSection({
    productName,
    quantity,
    onQuantityChange,
    customerName,
    onCustomerNameChange,
    customerPhone,
    onCustomerPhoneChange,
    deliveryAddress,
    onDeliveryAddressChange,
    shippingAreas,
    shippingAreaId,
    onShippingAreaChange,
    customerNote,
    onCustomerNoteChange,
    honeypotValue,
    onHoneypotChange,
    subtotal,
    shippingCharge,
    grandTotal,
    errors,
    processing,
    onSubmit,
}: {
    productName: string;
    quantity: number;
    onQuantityChange: (value: number) => void;
    customerName: string;
    onCustomerNameChange: (value: string) => void;
    customerPhone: string;
    onCustomerPhoneChange: (value: string) => void;
    deliveryAddress: string;
    onDeliveryAddressChange: (value: string) => void;
    shippingAreas: ShippingArea[];
    shippingAreaId: number | null;
    onShippingAreaChange: (value: number) => void;
    customerNote: string;
    onCustomerNoteChange: (value: string) => void;
    honeypotValue: string;
    onHoneypotChange: (value: string) => void;
    subtotal: number;
    shippingCharge: number;
    grandTotal: number;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    onSubmit: (e: FormEvent) => void;
}) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const activeImage = galleryImages[selectedImageIndex];

    return (
        <section
            id="checkout"
            className="scroll-mt-24 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 py-8 select-none sm:py-20"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <div className="text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/15 px-4 py-1 font-bengali text-xs font-semibold text-amber-800 shadow-sm">
                            <Sparkles className="size-3.5 text-amber-600" />
                            নিরাপদ অর্ডারিং
                        </span>
                        <h2 className="mt-3 font-bengali text-3xl font-extrabold text-stone-900 sm:text-4xl">
                            পণ্য নির্বাচন ও অর্ডার ফরম
                        </h2>
                        <p className="mt-2 font-bengali text-sm text-stone-600 sm:text-base">
                            {productName} — ছবি দেখে সহজেই নিচে অর্ডার সম্পন্ন করুন
                        </p>
                    </div>
                </Reveal>

                {/* 2-Column Integrated Layout: Big Product Selection & Order Form */}
                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
                    {/* Left Column: Big Product Viewer Window */}
                    <div className="flex flex-col space-y-6 lg:col-span-6">
                        <Reveal>
                            {/* Big Product Image Window */}
                            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-stone-950 p-6 shadow-2xl shadow-amber-900/20">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_70%)]"
                                />

                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImage.id}
                                        src={activeImage.src}
                                        alt={activeImage.alt}
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{
                                            duration: 0.35,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                        className="relative max-h-full w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
                                    />
                                </AnimatePresence>

                                {/* Rating Badge */}
                                <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full border border-amber-400/40 bg-stone-950/85 px-3 py-1 font-bengali text-xs font-semibold text-amber-300 shadow-md backdrop-blur-md">
                                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                    <span>১০০% প্রিমিয়াম কোয়ালিটি</span>
                                </div>
                            </div>

                            {/* Smaller Thumbnail Selection Windows */}
                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {galleryImages.map((img, idx) => (
                                    <button
                                        key={img.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedImageIndex(idx)
                                        }
                                        className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 p-1.5 transition-all duration-300 ${
                                            idx === selectedImageIndex
                                                ? 'scale-105 border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-400/50'
                                                : 'border-amber-200 bg-white opacity-75 hover:border-amber-400 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={img.src}
                                            alt={img.alt}
                                            className="size-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    {/* Right Column: Integrated Order Form & Checkout Summary */}
                    <div className="lg:col-span-6">
                        <Reveal delay={0.1}>
                            <form
                                onSubmit={onSubmit}
                                className="space-y-5 rounded-3xl border border-amber-200 bg-white p-6 font-bengali shadow-xl shadow-amber-900/10 sm:p-8"
                            >
                                {/* Anti-Spam Honeypot. The input's `name`
                                deliberately avoids words like "website" or
                                "url" - those are exactly what browser/
                                extension autofill (address-form heuristics,
                                password managers) key off of, and an
                                autofilled honeypot rejects a real shopper's
                                order, not a bot's. `readOnly` blocks native
                                browser/extension autofill entirely (they
                                respect it) while leaving the honeypot just
                                as effective against bots, which set the
                                value directly via script rather than
                                through the browser's own autofill. */}
                                <div
                                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                                    aria-hidden="true"
                                >
                                    <input
                                        type="text"
                                        name="hp_confirm_entry"
                                        value={honeypotValue}
                                        onChange={(e) =>
                                            onHoneypotChange(e.target.value)
                                        }
                                        tabIndex={-1}
                                        autoComplete="off"
                                        readOnly
                                    />
                                </div>

                                <div className="border-b border-amber-100 pb-3">
                                    <h3 className="text-xl font-bold text-stone-900">
                                        ডেলিভারি তথ্য প্রদান করুন
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ
                                        করবেন
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="customer_name"
                                            className="font-semibold text-stone-700"
                                        >
                                            পূর্ণ নাম
                                        </Label>
                                        <Input
                                            id="customer_name"
                                            value={customerName}
                                            onChange={(e) => {
                                                try {
                                                    e.target.setCustomValidity(
                                                        '',
                                                    );
                                                } catch {
                                                    // Ignore - see the
                                                    // phone field's onChange
                                                    // for why this must
                                                    // never block the
                                                    // actual state update.
                                                }

                                                onCustomerNameChange(
                                                    e.target.value,
                                                );
                                            }}
                                            onInvalid={(e) =>
                                                e.currentTarget.setCustomValidity(
                                                    'Name may only contain letters, spaces, dots, and hyphens (no numbers or links).',
                                                )
                                            }
                                            placeholder="আপনার নাম লিখুন"
                                            className={fieldClass}
                                            maxLength={60}
                                            pattern="[\p{Script=Bengali}\p{Script=Latin} .\-]+"
                                            required
                                        />
                                        <InputError
                                            message={errors.customer_name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="customer_phone"
                                            className="font-semibold text-stone-700"
                                        >
                                            মোবাইল নম্বর
                                        </Label>
                                        <Input
                                            id="customer_phone"
                                            type="tel"
                                            inputMode="numeric"
                                            pattern="01[3-9][0-9]{8}"
                                            value={customerPhone}
                                            onChange={(e) => {
                                                // The actual state update
                                                // (and the abandoned-checkout
                                                // tracking it triggers) must
                                                // never be blocked by this -
                                                // it's just resetting the
                                                // native validation message,
                                                // not core to the field
                                                // working.
                                                try {
                                                    e.target.setCustomValidity(
                                                        '',
                                                    );
                                                } catch {
                                                    // Ignore - see above.
                                                }

                                                onCustomerPhoneChange(
                                                    toEnglishDigits(
                                                        e.target.value,
                                                    ),
                                                );
                                            }}
                                            onInvalid={(e) =>
                                                e.currentTarget.setCustomValidity(
                                                    'Please provide a 11 digit valid Bangladesh phone number starts with 01',
                                                )
                                            }
                                            placeholder="01XXXXXXXXX"
                                            className={fieldClass}
                                            required
                                        />
                                        <InputError
                                            message={errors.customer_phone}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="delivery_address"
                                        className="font-semibold text-stone-700"
                                    >
                                        সম্পূর্ণ ঠিকানা
                                    </Label>
                                    <Textarea
                                        id="delivery_address"
                                        rows={2}
                                        value={deliveryAddress}
                                        onChange={(e) =>
                                            onDeliveryAddressChange(
                                                e.target.value,
                                            )
                                        }
                                        placeholder="বাসা/হোল্ডিং, রোড, এলাকা, জেলা"
                                        className={fieldClass}
                                        required
                                        minLength={10}
                                        maxLength={200}
                                    />
                                    <InputError
                                        message={errors.delivery_address}
                                    />
                                </div>

                                {/* Delivery Area Radio Group */}
                                <div className="grid gap-2">
                                    <Label className="font-semibold text-stone-700">
                                        ডেলিভারি এলাকা
                                    </Label>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {shippingAreas.map((area) => {
                                            const checked =
                                                shippingAreaId === area.id;

                                            return (
                                                <label
                                                    key={area.id}
                                                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                                                        checked
                                                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-400/50'
                                                            : 'border-amber-200 hover:border-amber-300'
                                                    }`}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="shipping_area_id"
                                                            checked={checked}
                                                            onChange={() =>
                                                                onShippingAreaChange(
                                                                    area.id,
                                                                )
                                                            }
                                                            className="size-4 accent-amber-600"
                                                        />
                                                        {shippingAreaLabel(
                                                            area.name,
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-stone-500">
                                                        ৳{area.charge}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                    <InputError
                                        message={errors.shipping_area_id}
                                    />
                                </div>

                                {/* Dedicated Compact Quantity Stepper Row */}
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="quantity"
                                        className="font-semibold text-stone-700"
                                    >
                                        বোতলের সংখ্যা (পরিমাণ)
                                    </Label>
                                    <div className="flex items-center gap-3">
                                        <QuantityStepper
                                            value={quantity}
                                            onChange={onQuantityChange}
                                        />
                                        <span className="text-xs font-medium text-stone-500">
                                            (প্রতি বোতল ৳
                                            {subtotal > 0 && quantity > 0
                                                ? (subtotal / quantity).toFixed(
                                                      0,
                                                  )
                                                : '791'}
                                            )
                                        </span>
                                    </div>
                                    <InputError message={errors.quantity} />
                                </div>

                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="customer_note"
                                        className="text-xs font-medium text-stone-700"
                                    >
                                        অর্ডার নোট (ঐচ্ছিক)
                                    </Label>
                                    <Textarea
                                        id="customer_note"
                                        rows={2}
                                        value={customerNote}
                                        onChange={(e) =>
                                            onCustomerNoteChange(e.target.value)
                                        }
                                        placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন"
                                        className={fieldClass}
                                        maxLength={100}
                                    />
                                    <InputError
                                        message={errors.customer_note}
                                    />
                                </div>

                                {/* Order Calculation Summary Box */}
                                <div className="space-y-3 rounded-2xl border border-stone-800 bg-stone-950 p-5 text-white shadow-lg">
                                    <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                                        <span>পণ্য ({quantity}টি বোতল)</span>
                                        <span>৳{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                                        <span>ডেলিভারি চার্জ</span>
                                        <span>
                                            ৳{shippingCharge.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 text-base font-bold text-amber-400">
                                        <span>সর্বমোট প্রদেয় মূল্য</span>
                                        <span className="text-xl font-extrabold">
                                            ৳{grandTotal.toFixed(2)}
                                        </span>
                                    </div>

                                    <InputError message={errors.order} />

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={processing}
                                        className="mt-2 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 bg-[length:200%_auto] text-base font-bold text-stone-950 shadow-xl transition-[background-position] duration-1000 hover:bg-right"
                                    >
                                        {processing
                                            ? 'অর্ডার হচ্ছে...'
                                            : 'অর্ডার কনফার্ম করুন'}
                                    </Button>

                                    <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-neutral-400">
                                        <Truck className="size-3.5 text-emerald-400" />
                                        <span>
                                            ক্যাশ অন ডেলিভারি — হাতে পেয়ে মূল্য পরিশোধ
                                            করুন
                                        </span>
                                    </p>
                                </div>
                            </form>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
