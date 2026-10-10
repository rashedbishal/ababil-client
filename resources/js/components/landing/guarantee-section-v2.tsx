import { ShieldCheck } from 'lucide-react';
import Magnetic from './motion/magnetic';
import Reveal from './motion/reveal';
import OrderButton from './order-button';

/** Concept-2 fork of `guarantee-section.tsx` in the unified light theme. */
export default function GuaranteeSectionV2() {
    return (
        <section className="relative overflow-hidden bg-white py-8 sm:py-14">
            <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                <Reveal>
                    <div className="inline-flex flex-col items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50/60 px-8 py-7 sm:px-14 sm:py-8">
                        <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
                            <ShieldCheck className="size-9" />
                        </span>
                        <h2 className="font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                            ৩ দিনের Money-Back গ্যারান্টি
                        </h2>
                        <p className="max-w-md font-bengali text-sm text-stone-600">
                            পণ্যে সন্তুষ্ট না হলে ডেলিভারির ৩ দিনের মধ্যে যোগাযোগ করুন —
                            শর্তসাপেক্ষে টাকা ফেরত দেওয়া হবে।
                        </p>
                        <Magnetic strength={0.25}>
                            <OrderButton href="#payment">অর্ডার করুন</OrderButton>
                        </Magnetic>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
