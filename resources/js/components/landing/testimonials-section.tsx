import { Quote, Star } from 'lucide-react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

/**
 * Placeholder sample quotes with stylized monogram avatars — swap for real
 * customer reviews (and photos, if available) once ready. Kept in this one
 * array so the section can be updated without touching the layout below.
 */
const testimonials = [
    {
        name: 'রফিকুল ইসলাম',
        location: 'ঢাকা',
        quote: 'হাঁটুর ব্যথায় বছরের পর বছর ভুগছিলাম। আবাবিল ব্যবহারের পর সত্যিই আরাম পেয়েছি।',
        ring: 'from-amber-300 to-yellow-600',
    },
    {
        name: 'সাবিনা ইয়াসমিন',
        location: 'চট্টগ্রাম',
        quote: 'সিজারের পর কোমরের ব্যথায় প্রতিদিন কষ্ট হতো। এখন নিয়মিত ম্যাসাজ করি, অনেকটাই আরাম।',
        ring: 'from-yellow-400 to-amber-600',
    },
    {
        name: 'আব্দুল করিম',
        location: 'সিলেট',
        quote: 'তেলটা তাড়াতাড়ি শুষে নেয়, জামায় দাগও লাগে না। ঘাড়-কাঁধের ব্যথায় খুব কাজে দিয়েছে।',
        ring: 'from-amber-400 to-amber-700',
    },
];

export default function TestimonialsSection() {
    return (
        <section
            id="reviews"
            className="relative scroll-mt-24 overflow-hidden bg-stone-950 py-16 sm:py-24"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgb(251,191,36,0.12),transparent_50%)]"
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_85%_100%,rgb(251,191,36,0.1),transparent_50%)]"
            />
            <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent"
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="text-center">
                    <span className="mx-auto block w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-400">
                        ৫০০০+ সন্তুষ্ট গ্রাহক
                    </span>
                    <h2 className="mt-4 text-center font-bengali text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                        গ্রাহকদের অভিজ্ঞতা
                    </h2>
                </Reveal>

                <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {testimonials.map(({ name, location, quote, ring }) => (
                        <RevealItem key={name}>
                            <TiltCard
                                strength={6}
                                className="relative overflow-hidden rounded-[1.75rem] border border-amber-400/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 pt-11 shadow-2xl shadow-black/40 backdrop-blur-sm"
                            >
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-amber-400/10 blur-2xl"
                                />

                                <span
                                    className={`absolute -top-6 left-7 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-stone-950 shadow-lg ring-2 shadow-amber-900/40 ring-stone-950 ${ring}`}
                                >
                                    {name.charAt(0)}
                                </span>
                                <Quote className="absolute top-6 right-6 size-7 text-amber-400/25" />

                                <div className="flex gap-0.5 text-amber-400">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className="size-4 fill-current"
                                        />
                                    ))}
                                </div>

                                <p className="mt-4 font-bengali text-sm leading-relaxed text-neutral-300">
                                    “{quote}”
                                </p>

                                <div className="mt-6 border-t border-amber-400/10 pt-4 font-bengali text-sm">
                                    <p className="font-semibold text-white">
                                        {name}
                                    </p>
                                    <p className="text-neutral-500">
                                        {location}
                                    </p>
                                </div>
                            </TiltCard>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
