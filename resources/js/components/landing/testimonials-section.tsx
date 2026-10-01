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
        ring: 'from-amber-400 to-yellow-600',
    },
    {
        name: 'সাবিনা ইয়াসমিন',
        location: 'চট্টগ্রাম',
        quote: 'সিজারের পর কোমরের ব্যথায় প্রতিদিন কষ্ট হতো। এখন নিয়মিত ম্যাসাজ করি, অনেকটাই আরাম।',
        ring: 'from-rose-400 to-amber-500',
    },
    {
        name: 'আব্দুল করিম',
        location: 'সিলেট',
        quote: 'তেলটা তাড়াতাড়ি শুষে নেয়, জামায় দাগও লাগে না। ঘাড়-কাঁধের ব্যথায় খুব কাজে দিয়েছে।',
        ring: 'from-amber-500 to-orange-600',
    },
];

export default function TestimonialsSection() {
    return (
        <section className="relative overflow-hidden bg-stone-950 py-14 sm:py-20">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgb(217,161,65,0.15),transparent_55%)]"
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <span className="mx-auto block w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-400">
                        ৫০০০+ সন্তুষ্ট গ্রাহক
                    </span>
                    <h2 className="mt-4 text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                        গ্রাহকদের অভিজ্ঞতা
                    </h2>
                </Reveal>

                <RevealGroup className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map(({ name, location, quote, ring }) => (
                        <RevealItem key={name}>
                            <TiltCard
                                strength={5}
                                className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-7 pt-10 backdrop-blur-sm"
                            >
                                <span
                                    className={`absolute -top-6 left-7 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-stone-950 shadow-lg ${ring}`}
                                >
                                    {name.charAt(0)}
                                </span>
                                <Quote className="absolute top-6 right-6 size-7 text-amber-500/20" />

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

                                <div className="mt-6 border-t border-white/10 pt-4 font-bengali text-sm">
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
