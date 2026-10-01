import {
    BadgeCheck,
    Clock,
    MapPinned,
    PhoneCall,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import mapImage from '../../../images/landing/bangladesh-map.webp';
import Reveal from './motion/reveal';

const pins = [
    { label: 'রংপুর', x: 22, y: 12 },
    { label: 'রাজশাহী', x: 18, y: 30 },
    { label: 'সিলেট', x: 58, y: 16 },
    { label: 'ঢাকা', x: 44, y: 40 },
    { label: 'খুলনা', x: 24, y: 68 },
    { label: 'বরিশাল', x: 36, y: 74 },
    { label: 'চট্টগ্রাম', x: 63, y: 68 },
];

const callouts = [
    {
        icon: MapPinned,
        text: '৮ বিভাগ, ৬৪ জেলা জুড়ে ডেলিভারি',
        pos: 'top-[2%] left-0 lg:left-[-2%]',
        floatDelay: 0,
    },
    {
        icon: Truck,
        text: 'সারা বাংলাদেশে হোম ডেলিভারি',
        pos: 'top-0 right-0 lg:right-[-2%]',
        floatDelay: 0.6,
    },
    {
        icon: Clock,
        text: 'মাত্র ৩-৫ দিনে হাতে পাবেন',
        pos: 'top-[46%] -left-4 lg:left-[-8%]',
        floatDelay: 1.2,
    },
    {
        icon: BadgeCheck,
        text: 'ক্যাশ অন ডেলিভারি সুবিধা',
        pos: 'top-[48%] -right-4 lg:right-[-8%]',
        floatDelay: 0.3,
    },
    {
        icon: ShieldCheck,
        text: '৩ দিনের মানি-ব্যাক গ্যারান্টি',
        pos: 'bottom-[2%] left-0 lg:left-[0%]',
        floatDelay: 0.9,
    },
    {
        icon: PhoneCall,
        text: 'অর্ডার কনফার্মেশন কলে',
        pos: 'bottom-0 right-0 lg:right-[0%]',
        floatDelay: 1.5,
    },
];

function Pin({ x, y, delay }: { x: number; y: number; delay: number }) {
    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <span className="relative flex size-3.5">
                <span
                    className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-amber-500"
                    style={{ animationDelay: `${delay}s` }}
                />
                <span className="relative inline-flex size-3.5 rounded-full bg-stone-950 ring-2 ring-amber-200" />
            </span>
        </div>
    );
}

export default function NationwideSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400 py-20 sm:py-28">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,250,220,0.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(120,72,0,0.14),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.18),transparent_55%)]"
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_50%_0%,transparent_0,transparent_60px,rgb(120,72,0,0.05)_61px)]"
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-stone-900/15 bg-white/40 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-stone-800 backdrop-blur-sm">
                        নেশনওয়াইড হোম ডেলিভারি
                    </span>
                    <h2 className="mt-4 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
                        দেশের প্রতিটি প্রান্তে পৌঁছে যাচ্ছে আবাবিল
                    </h2>
                </Reveal>

                <div className="relative mx-auto mt-10 max-w-md py-10 sm:py-16 lg:max-w-3xl lg:py-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 2.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative mx-auto max-w-md lg:max-w-2xl"
                    >
                        <div
                            aria-hidden
                            className="absolute inset-0 scale-90 rounded-full bg-white/25 blur-3xl"
                        />
                        <img
                            src={mapImage}
                            alt="সারা বাংলাদেশে আবাবিল হোম ডেলিভারি"
                            className="relative w-full drop-shadow-[0_35px_45px_rgba(87,53,0,0.35)]"
                        />
                        {pins.map((pin, i) => (
                            <Pin
                                key={pin.label}
                                x={pin.x}
                                y={pin.y}
                                delay={i * 0.3}
                            />
                        ))}
                    </motion.div>

                    {callouts.map(
                        ({ icon: Icon, text, pos, floatDelay }, i) => (
                            <Reveal
                                key={text}
                                delay={0.2 + i * 0.12}
                                className={`absolute z-10 hidden max-w-[13rem] lg:block ${pos}`}
                            >
                                <div
                                    className="animate-float-slow flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-stone-950/90 px-4 py-3.5 shadow-2xl shadow-stone-950/30 backdrop-blur-md"
                                    style={{ animationDelay: `${floatDelay}s` }}
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-950">
                                        <Icon className="size-5" />
                                    </span>
                                    <span className="font-bengali text-sm leading-snug font-medium text-white">
                                        {text}
                                    </span>
                                </div>
                            </Reveal>
                        ),
                    )}
                </div>

                <Reveal delay={0.15}>
                    <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
                        {callouts.map(({ icon: Icon, text }) => (
                            <div
                                key={text}
                                className="flex items-center gap-2.5 rounded-2xl border border-amber-300/30 bg-stone-950/90 px-3.5 py-3 shadow-lg backdrop-blur-sm"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-950">
                                    <Icon className="size-4" />
                                </span>
                                <span className="font-bengali text-xs leading-snug font-medium text-white">
                                    {text}
                                </span>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
