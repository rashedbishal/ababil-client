import { BadgeCheck, FlaskConical, ShieldCheck } from 'lucide-react';

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
        <section className="bg-neutral-900/60 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    মান নিয়ন্ত্রণ ও বিশ্বস্ততা
                </h2>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                    {badges.map(({ title, icon: Icon }) => (
                        <div
                            key={title}
                            className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-neutral-950/60 px-6 py-8 text-center"
                        >
                            <span className="flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                <Icon className="size-7" />
                            </span>
                            <span className="font-bengali font-medium text-neutral-200">
                                {title}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mt-6 text-center font-bengali text-xs text-neutral-500">
                    ল্যাব সার্টিফিকেট প্রস্তুত করা হচ্ছে — শীঘ্রই এই সেকশনে প্রকাশ করা হবে।
                </p>
            </div>
        </section>
    );
}
