import { BadgeCheck, FlaskConical, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';

const badges = [
    { title: 'মাইক্রোবায়োলজিক্যাল টেস্ট', icon: FlaskConical },
    { title: 'কেমিক্যাল QC টেস্ট', icon: ShieldCheck },
    { title: 'অ্যালার্জিক ত্বকের জন্য নিরাপদ', icon: BadgeCheck },
];

const SEAL_CLIP =
    'polygon(50% 0%, 61% 10%, 75% 6%, 80% 19%, 94% 20%, 94% 35%, 100% 50%, 94% 65%, 94% 80%, 80% 81%, 75% 94%, 61% 90%, 50% 100%, 39% 90%, 25% 94%, 20% 81%, 6% 80%, 6% 65%, 0% 50%, 6% 35%, 6% 20%, 20% 19%, 25% 6%, 39% 10%)';

export default function TrustSection() {
    return (
        <section className="relative overflow-hidden bg-stone-950 py-14 sm:py-20">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.12),transparent_60%)]"
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                        মান নিয়ন্ত্রণ ও বিশ্বস্ততা
                    </h2>
                </Reveal>

                <RevealGroup className="mt-12 grid gap-10 sm:grid-cols-3">
                    {badges.map(({ title, icon: Icon }) => (
                        <RevealItem
                            key={title}
                            className="flex flex-col items-center gap-4 text-center"
                        >
                            <motion.div
                                whileHover={{ rotate: 8, scale: 1.05 }}
                                transition={{ duration: 1.5 }}
                                style={{ clipPath: SEAL_CLIP }}
                                className="flex size-28 items-center justify-center bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-lg shadow-amber-900/30"
                            >
                                <span
                                    style={{ clipPath: SEAL_CLIP }}
                                    className="flex size-[88%] items-center justify-center bg-stone-950 text-amber-400"
                                >
                                    <Icon className="size-9" />
                                </span>
                            </motion.div>
                            <span className="max-w-[14rem] font-bengali font-medium text-neutral-200">
                                {title}
                            </span>
                        </RevealItem>
                    ))}
                </RevealGroup>

                <p className="mt-10 text-center font-bengali text-xs text-neutral-500">
                    ল্যাব সার্টিফিকেট প্রস্তুত করা হচ্ছে — শীঘ্রই এই সেকশনে প্রকাশ করা হবে।
                </p>
            </div>
        </section>
    );
}
