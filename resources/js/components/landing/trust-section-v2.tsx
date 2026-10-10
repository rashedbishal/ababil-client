import { BadgeCheck, FlaskConical, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';

const badges = [
    { title: 'মাইক্রোবায়োলজিক্যাল টেস্ট', icon: FlaskConical },
    { title: 'কেমিক্যাল QC টেস্ট', icon: ShieldCheck },
    { title: 'অ্যালার্জিক ত্বকের জন্য নিরাপদ', icon: BadgeCheck },
];

/**
 * Concept-2's unified "e-commerce" theme: white cards, amber-500 accents,
 * soft shadows - a sibling of `trust-section.tsx`, which stays untouched
 * for the live `/` page's dark theme.
 */
export default function TrustSectionV2() {
    return (
        <section className="relative overflow-hidden bg-white py-8 sm:py-14">
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        মান নিয়ন্ত্রণ ও বিশ্বস্ততা
                    </h2>
                </Reveal>

                <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-3">
                    {badges.map(({ title, icon: Icon }) => (
                        <RevealItem
                            key={title}
                            className="flex flex-col items-center gap-4 rounded-3xl border border-amber-200 bg-amber-50/50 p-6 text-center shadow-sm shadow-amber-900/5"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 1.5 }}
                                className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md"
                            >
                                <Icon className="size-7" />
                            </motion.div>
                            <span className="max-w-[14rem] font-bengali font-medium text-stone-700">
                                {title}
                            </span>
                        </RevealItem>
                    ))}
                </RevealGroup>

                <p className="mt-10 text-center font-bengali text-xs text-stone-400">
                    ল্যাব সার্টিফিকেট প্রস্তুত করা হচ্ছে — শীঘ্রই এই সেকশনে প্রকাশ করা হবে।
                </p>
            </div>
        </section>
    );
}
