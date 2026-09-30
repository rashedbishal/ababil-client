import { BadgeCheck, FlaskConical, ShieldCheck } from 'lucide-react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

const badges = [
    {
        title: 'মাইক্রোবায়োলজিক্যাল টেস্ট',
        icon: FlaskConical,
    },
    {
        title: 'কেমিক্যাল QC টেস্ট',
        icon: ShieldCheck,
    },
    {
        title: 'অ্যালার্জিক ত্বকের জন্য নিরাপদ',
        icon: BadgeCheck,
    },
];

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

                <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-3">
                    {badges.map(({ title, icon: Icon }) => (
                        <RevealItem key={title}>
                            <TiltCard
                                strength={6}
                                className="relative flex flex-col items-center gap-3 rounded-xl border border-amber-500/20 bg-white/5 px-6 py-8 text-center"
                            >
                                <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                    <Icon className="size-7" />
                                </span>
                                <span className="font-bengali font-medium text-neutral-200">
                                    {title}
                                </span>
                            </TiltCard>
                        </RevealItem>
                    ))}
                </RevealGroup>

                <p className="mt-6 text-center font-bengali text-xs text-neutral-500">
                    ল্যাব সার্টিফিকেট প্রস্তুত করা হচ্ছে — শীঘ্রই এই সেকশনে প্রকাশ করা হবে।
                </p>
            </div>
        </section>
    );
}
