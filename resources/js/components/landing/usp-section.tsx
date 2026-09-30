import { Droplets, Flame, Hand, Leaf, Sparkles, Timer } from 'lucide-react';

const usps = [
    {
        title: 'থেরাপিউটিক ওয়ার্মিং',
        description: 'ত্বকে প্রাকৃতিক উষ্ণতা তৈরি করে পেশি শিথিল করে।',
        icon: Flame,
    },
    {
        title: 'নন-স্টিকি ড্রাই ফর্মুলা',
        description: 'ব্যবহারের পর কোনো আঠালো বা তৈলাক্ত ভাব থাকে না।',
        icon: Droplets,
    },
    {
        title: 'দ্রুত শোষণ',
        description: 'মাত্র ২-৩ মিনিটেই ত্বকে সম্পূর্ণ শোষিত হয়ে যায়।',
        icon: Timer,
    },
    {
        title: 'সহজ ম্যাসাজ',
        description: 'মসৃণ টেক্সচারের কারণে সহজেই ম্যাসাজ করা যায়।',
        icon: Hand,
    },
    {
        title: 'হারবাল ফর্মুলেশন',
        description: '৯টি প্রাকৃতিক ভেষজ উপাদানের অনন্য সংমিশ্রণ।',
        icon: Leaf,
    },
    {
        title: 'স্কিন কেয়ার',
        description: 'ত্বকের বিবর্ণতা কমাতে সাহায্য করে, অ্যালার্জিক ত্বকেও নিরাপদ।',
        icon: Sparkles,
    },
];

export default function UspSection() {
    return (
        <section className="bg-neutral-900/60 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    কেন আবাবিল বেছে নেবেন
                </h2>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {usps.map(({ title, description, icon: Icon }) => (
                        <div
                            key={title}
                            className="rounded-xl border border-white/10 bg-neutral-950/60 p-6"
                        >
                            <span className="flex size-11 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                <Icon className="size-5" />
                            </span>
                            <h3 className="mt-4 font-bengali text-lg font-semibold text-white">
                                {title}
                            </h3>
                            <p className="mt-1.5 font-bengali text-sm text-neutral-400">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
