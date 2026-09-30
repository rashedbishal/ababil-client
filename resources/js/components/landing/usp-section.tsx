import { Droplets, Flame, Hand, Leaf, Sparkles, Timer } from 'lucide-react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

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
        <section className="relative overflow-hidden bg-amber-100/60 py-14 sm:py-20">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(217,161,65,0.15),transparent_45%)]"
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        কেন আবাবিল বেছে নেবেন
                    </h2>
                </Reveal>

                <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {usps.map(({ title, description, icon: Icon }) => (
                        <RevealItem key={title}>
                            <TiltCard
                                strength={6}
                                className="relative rounded-xl border border-amber-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-amber-900/10"
                            >
                                <span className="flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                    <Icon className="size-5" />
                                </span>
                                <h3 className="mt-4 font-bengali text-lg font-semibold text-stone-900">
                                    {title}
                                </h3>
                                <p className="mt-1.5 font-bengali text-sm text-stone-600">
                                    {description}
                                </p>
                            </TiltCard>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
