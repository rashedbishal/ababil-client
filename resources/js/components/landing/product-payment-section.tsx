import { Banknote, CreditCard, Lock, Smartphone, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { CheckoutForm } from '@/hooks/use-checkout-form';
import Reveal from './motion/reveal';
import OrderTriggerButton from './order-trigger-button';
import ProductImageViewer, { type ViewerImage } from './product-image-viewer';
import QuantityStepper from './quantity-stepper';

const otherMethods = [
    { label: 'bKash', icon: Smartphone },
    { label: 'Nagad', icon: Smartphone },
    { label: 'Card', icon: CreditCard },
];

/**
 * Concept 1's payment section: the product image viewer and quantity
 * selector stay on the page (like the live `/` page's inline checkout
 * section), while the rest of the checkout form (name/phone/address/
 * shipping area/note) lives in the shared `CheckoutDialog` popup.
 */
export default function ProductPaymentSection({
    productName,
    images,
    checkout,
    onOrderNowClick,
}: {
    productName: string;
    images: ViewerImage[];
    checkout: CheckoutForm;
    onOrderNowClick: () => void;
}) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const activeImage = images[selectedImageIndex];

    const { data, setField, subtotal, shippingCharge, grandTotal } = checkout;

    return (
        <section
            id="payment"
            className="scroll-mt-24 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 py-8 select-none sm:py-14"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <div className="text-center">
                        <h2 className="mt-3 font-bengali text-3xl font-extrabold text-stone-900 sm:text-4xl">
                            পণ্য নির্বাচন ও পেমেন্ট
                        </h2>
                        <p className="mt-2 font-bengali text-sm text-stone-600 sm:text-base">
                            {productName} — পরিমাণ নির্বাচন করে অর্ডার করুন
                        </p>
                    </div>
                </Reveal>

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
                    {/* Left: product image viewer, same as the live page's
                        inline checkout section. */}
                    <div className="flex flex-col space-y-6 lg:col-span-6">
                        <Reveal>
                            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-amber-300/80 bg-stone-950 p-6 shadow-2xl shadow-amber-900/20">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_70%)]"
                                />

                                <button
                                    type="button"
                                    onClick={() => setViewerOpen(true)}
                                    aria-label="ছবিটি বড় করে দেখুন"
                                    className="relative flex size-full items-center justify-center"
                                >
                                    <AnimatePresence mode="wait">
                                        {activeImage && (
                                            <motion.img
                                                key={activeImage.id}
                                                src={activeImage.src}
                                                alt={activeImage.alt}
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.94,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.94,
                                                }}
                                                transition={{
                                                    duration: 0.35,
                                                    ease: [0.16, 1, 0.3, 1],
                                                }}
                                                className="relative max-h-full w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.85)]"
                                            />
                                        )}
                                    </AnimatePresence>
                                </button>

                                <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full border border-amber-400/40 bg-stone-950/85 px-3 py-1 font-bengali text-xs font-semibold text-amber-300 shadow-md backdrop-blur-md">
                                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                    <span>১০০% প্রিমিয়াম কোয়ালিটি</span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-4 gap-3">
                                {images.map((img, idx) => (
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

                    {/* Right: cosmetic payment method selector + quantity +
                        Order Now (opens the popup with the rest of the
                        form). */}
                    <div className="lg:col-span-6">
                        <Reveal delay={0.1}>
                            <div className="space-y-5 rounded-3xl border border-amber-200 bg-white p-6 font-bengali shadow-xl shadow-amber-900/10 sm:p-8">
                                <div className="border-b border-amber-100 pb-3">
                                    <h3 className="text-xl font-bold text-stone-900">
                                        পেমেন্ট মেথড নির্বাচন করুন
                                    </h3>
                                    <p className="text-xs text-stone-500">
                                        ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ
                                        করবেন
                                    </p>
                                </div>

                                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-amber-500 bg-amber-500/10 px-4 py-4 ring-1 ring-amber-400/50">
                                    <span className="flex items-center gap-3">
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-stone-950">
                                            <Banknote className="size-5" />
                                        </span>
                                        <span>
                                            <span className="block font-bold text-stone-900">
                                                ক্যাশ অন ডেলিভারি
                                            </span>
                                            <span className="block text-xs text-stone-500">
                                                পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন
                                            </span>
                                        </span>
                                    </span>
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        checked
                                        readOnly
                                        className="size-5 accent-amber-600"
                                    />
                                </label>

                                <div className="grid grid-cols-3 gap-3">
                                    {otherMethods.map(
                                        ({ label, icon: Icon }) => (
                                            <div
                                                key={label}
                                                aria-disabled
                                                className="flex flex-col items-center gap-1.5 rounded-2xl border border-stone-200 bg-stone-50 px-2 py-3 text-stone-400 opacity-60"
                                            >
                                                <Icon className="size-5" />
                                                <span className="text-xs font-semibold">
                                                    {label}
                                                </span>
                                                <span className="text-[10px]">
                                                    শীঘ্রই আসছে
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <span className="font-semibold text-stone-700">
                                        বোতলের সংখ্যা (পরিমাণ)
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <QuantityStepper
                                            value={data.quantity}
                                            onChange={(value) =>
                                                setField('quantity', value)
                                            }
                                        />
                                        <span className="text-xs font-medium text-stone-500">
                                            (প্রতি বোতল ৳
                                            {subtotal > 0 && data.quantity > 0
                                                ? (
                                                      subtotal / data.quantity
                                                  ).toFixed(0)
                                                : '791'}
                                            )
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 rounded-2xl border border-stone-800 bg-stone-950 p-5 text-white shadow-lg">
                                    <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-sm text-neutral-300">
                                        <span>
                                            পণ্য ({data.quantity}টি বোতল)
                                        </span>
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

                                    <OrderTriggerButton
                                        onClick={onOrderNowClick}
                                        className="mt-2 w-full"
                                    >
                                        অর্ডার করুন
                                    </OrderTriggerButton>

                                    <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-neutral-400">
                                        <Lock className="size-3.5 text-emerald-400" />
                                        <span>
                                            নিরাপদ অর্ডারিং — ডেলিভারি ঠিকানা পরের ধাপে
                                            দিন
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>

            <ProductImageViewer
                images={images}
                initialIndex={selectedImageIndex}
                open={viewerOpen}
                onOpenChange={setViewerOpen}
            />
        </section>
    );
}
