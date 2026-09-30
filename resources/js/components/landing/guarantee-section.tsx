import { ShieldCheck } from 'lucide-react';

export default function GuaranteeSection() {
    return (
        <section className="bg-neutral-900/60 py-14 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                <div className="inline-flex flex-col items-center gap-4 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent px-8 py-10 sm:px-14">
                    <span className="flex size-16 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                        <ShieldCheck className="size-9" />
                    </span>
                    <h2 className="font-bengali text-2xl font-bold text-white sm:text-3xl">
                        ৩ দিনের Money-Back গ্যারান্টি
                    </h2>
                    <p className="max-w-md font-bengali text-sm text-neutral-400">
                        পণ্যে সন্তুষ্ট না হলে ডেলিভারির ৩ দিনের মধ্যে যোগাযোগ করুন —
                        শর্তসাপেক্ষে টাকা ফেরত দেওয়া হবে।
                    </p>
                </div>
            </div>
        </section>
    );
}
