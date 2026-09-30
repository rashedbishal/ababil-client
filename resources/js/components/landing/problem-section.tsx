import { Activity, Bone, Footprints, UserRound, Zap } from 'lucide-react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

const problems = [
    { label: 'হাঁটু ও জয়েন্ট', icon: Bone },
    { label: 'পিঠ ও কোমর', icon: Activity },
    { label: 'ঘাড় ও কাঁধ', icon: UserRound },
    { label: 'পেশির টান', icon: Zap },
    { label: 'পা ও গোড়ালি', icon: Footprints },
];

export default function ProblemSection() {
    return (
        <section className="bg-gradient-to-b from-amber-50 to-white py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        শরীরের যেসব স্থানে ব্যথা কমাতে সাহায্য করে
                    </h2>
                </Reveal>

                <RevealGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {problems.map(({ label, icon: Icon }) => (
                        <RevealItem key={label}>
                            <TiltCard
                                strength={8}
                                className="relative flex flex-col items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 py-6 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-amber-900/10"
                            >
                                <span className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                                    <Icon className="size-6" />
                                </span>
                                <span className="font-bengali text-sm font-medium text-stone-800">
                                    {label}
                                </span>
                            </TiltCard>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
