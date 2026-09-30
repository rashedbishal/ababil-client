import { Activity, Bone, Footprints, UserRound, Zap } from 'lucide-react';

const problems = [
    { label: 'হাঁটু ও জয়েন্ট', icon: Bone },
    { label: 'পিঠ ও কোমর', icon: Activity },
    { label: 'ঘাড় ও কাঁধ', icon: UserRound },
    { label: 'পেশির টান', icon: Zap },
    { label: 'পা ও গোড়ালি', icon: Footprints },
];

export default function ProblemSection() {
    return (
        <section className="bg-neutral-950 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <h2 className="text-center font-bengali text-2xl font-bold text-white sm:text-3xl">
                    শরীরের যেসব স্থানে ব্যথা কমাতে সাহায্য করে
                </h2>

                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {problems.map(({ label, icon: Icon }) => (
                        <div
                            key={label}
                            className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center transition hover:border-amber-500/40 hover:bg-white/10"
                        >
                            <span className="flex size-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
                                <Icon className="size-6" />
                            </span>
                            <span className="font-bengali text-sm font-medium text-neutral-200">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
