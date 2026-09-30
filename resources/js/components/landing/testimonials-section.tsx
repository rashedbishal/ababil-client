import { Star } from 'lucide-react';

/**
 * Placeholder sample quotes — swap for real customer reviews once
 * available. Kept in this one array so the section can be updated without
 * touching the layout below.
 */
const testimonials = [
    {
        name: 'রফিকুল ইসলাম',
        location: 'ঢাকা',
        quote: 'হাঁটুর ব্যথায় বছরের পর বছর ভুগছিলাম। আবাবিল ব্যবহারের পর সত্যিই আরাম পেয়েছি।',
    },
    {
        name: 'সাবিনা ইয়াসমিন',
        location: 'চট্টগ্রাম',
        quote: 'সিজারের পর কোমরের ব্যথায় প্রতিদিন কষ্ট হতো। এখন নিয়মিত ম্যাসাজ করি, অনেকটাই আরাম।',
    },
    {
        name: 'আব্দুল করিম',
        location: 'সিলেট',
        quote: 'তেলটা তাড়াতাড়ি শুষে নেয়, জামায় দাগও লাগে না। ঘাড়-কাঁধের ব্যথায় খুব কাজে দিয়েছে।',
    },
];

export default function TestimonialsSection() {
    return (
        <section className="bg-neutral-950 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    গ্রাহকদের অভিজ্ঞতা
                </h2>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map(({ name, location, quote }) => (
                        <div
                            key={name}
                            className="rounded-xl border border-white/10 bg-white/5 p-6"
                        >
                            <div className="flex gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className="size-4 fill-current"
                                    />
                                ))}
                            </div>
                            <p className="mt-4 font-bengali text-sm text-neutral-300">
                                “{quote}”
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-full bg-amber-500/15 font-bengali text-sm font-semibold text-amber-400">
                                    {name.charAt(0)}
                                </span>
                                <div className="font-bengali text-sm">
                                    <p className="font-medium text-white">
                                        {name}
                                    </p>
                                    <p className="text-neutral-500">
                                        {location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
