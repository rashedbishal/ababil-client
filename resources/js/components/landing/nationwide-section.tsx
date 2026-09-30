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

const stats = [
    { value: '৮', label: 'বিভাগ' },
    { value: '৬৪', label: 'জেলা' },
    { value: '৩-৫', label: 'দিনে ডেলিভারি' },
];

function Pin({ x, y, delay }: { x: number; y: number; delay: number }) {
    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <span className="relative flex size-3">
                <span
                    className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-amber-500"
                    style={{ animationDelay: `${delay}s` }}
                />
                <span className="relative inline-flex size-3 rounded-full bg-stone-900 ring-2 ring-amber-200" />
            </span>
        </div>
    );
}

export default function NationwideSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400 py-16 sm:py-24">
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
                    <p className="mt-3 font-bengali text-sm text-stone-700 sm:text-base">
                        পাহাড়ে হাইকিং করা ভ্রমণপিপাসু হোক, সারাদিন দাঁড়িয়ে কাজ করা কর্মজীবী
                        হোক, কিংবা বয়সের ভারে জর্জরিত মা-বাবা — বাংলাদেশের আটটি বিভাগের
                        প্রতিটি ঘরে হোম ডেলিভারিতে পৌঁছে যাচ্ছে আবাবিল অর্গানিক পেইন
                        রিলিফ অয়েল।
                    </p>
                </Reveal>

                <motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mx-auto mt-10 max-w-3xl"
                >
                    <img
                        src={mapImage}
                        alt="সারা বাংলাদেশে আবাবিল হোম ডেলিভারি"
                        className="relative w-full"
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

                <Reveal delay={0.15}>
                    <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-4 text-center">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-stone-900/10 bg-white/50 py-4 backdrop-blur-sm"
                            >
                                <div className="font-bengali text-2xl font-bold text-stone-900">
                                    {stat.value}
                                </div>
                                <div className="font-bengali text-xs text-stone-700">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
