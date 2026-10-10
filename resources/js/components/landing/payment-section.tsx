import { Banknote, CreditCard, Lock, Smartphone } from 'lucide-react';
import Reveal from './motion/reveal';
import OrderTriggerButton from './order-trigger-button';

const otherMethods = [
    { label: 'bKash', icon: Smartphone },
    { label: 'Nagad', icon: Smartphone },
    { label: 'Card', icon: CreditCard },
];

/**
 * Cosmetic-only payment method selector - the backend only ever processes
 * Cash on Delivery (no payment gateway integration, nothing to send here),
 * so Cash on Delivery is the sole functional option; the other methods are
 * shown for the e-commerce "pick a payment method" vibe but are disabled.
 */
export default function PaymentSection({
    onOrderNowClick,
}: {
    onOrderNowClick: () => void;
}) {
    return (
        <section
            id="payment"
            className="scroll-mt-24 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 py-10 sm:py-16"
        >
            <div className="mx-auto max-w-2xl px-4 sm:px-6">
                <Reveal className="text-center">
                    <span className="inline-block rounded-full border border-amber-400/50 bg-amber-500/15 px-4 py-1 font-bengali text-xs font-semibold text-amber-800">
                        পেমেন্ট মেথড নির্বাচন করুন
                    </span>
                    <h2 className="mt-3 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        কীভাবে পরিশোধ করতে চান?
                    </h2>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="mt-8 space-y-3 rounded-3xl border border-amber-200 bg-white p-5 shadow-xl shadow-amber-900/10 sm:p-7">
                        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-amber-500 bg-amber-500/10 px-4 py-4 ring-1 ring-amber-400/50">
                            <span className="flex items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-stone-950">
                                    <Banknote className="size-5" />
                                </span>
                                <span className="font-bengali">
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
                            {otherMethods.map(({ label, icon: Icon }) => (
                                <div
                                    key={label}
                                    aria-disabled
                                    className="flex flex-col items-center gap-1.5 rounded-2xl border border-stone-200 bg-stone-50 px-2 py-3 text-stone-400 opacity-60"
                                >
                                    <Icon className="size-5" />
                                    <span className="text-xs font-semibold">
                                        {label}
                                    </span>
                                    <span className="font-bengali text-[10px]">
                                        শীঘ্রই আসছে
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-2 text-center">
                            <OrderTriggerButton onClick={onOrderNowClick}>
                                অর্ডার করুন
                            </OrderTriggerButton>
                        </div>

                        <p className="flex items-center justify-center gap-1.5 pt-1 font-bengali text-xs text-stone-500">
                            <Lock className="size-3.5" />
                            <span>নিরাপদ অর্ডারিং — কোনো অগ্রিম পেমেন্ট নয়</span>
                        </p>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
