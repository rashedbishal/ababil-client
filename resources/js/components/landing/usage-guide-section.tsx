import cleanseImg from '../../../images/landing/cards/usage-cleanse.webp';
import dispenseImg from '../../../images/landing/cards/usage-dispense.webp';
import massageImg from '../../../images/landing/cards/usage-massage.webp';
import routineImg from '../../../images/landing/cards/usage-routine.webp';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

const steps = [
    {
        step: '১',
        title: 'ক্লিনজ',
        description: 'যেখানে ব্যথা অনুভব করছেন সেই স্থানটি হালকা পরিষ্কার করে নিন।',
        image: cleanseImg,
    },
    {
        step: '২',
        title: 'পরিমাণমতো নিন',
        description: 'হাতের তালুতে প্রয়োজনমতো অয়েল নিন।',
        image: dispenseImg,
    },
    {
        step: '৩',
        title: 'আলতো ম্যাসাজ',
        description: 'বৃত্তাকার ভঙ্গিতে আলতোভাবে ম্যাসাজ করুন যতক্ষণ না শোষিত হয়।',
        image: massageImg,
    },
    {
        step: '৪',
        title: 'নিয়মিত ব্যবহার',
        description: 'ভালো ফলাফলের জন্য দিনে ২-৩ বার নিয়মিত ব্যবহার করুন।',
        image: routineImg,
    },
];

export default function UsageGuideSection() {
    return (
        <section className="bg-gradient-to-b from-white to-amber-50 py-14 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        ব্যবহারের নিয়ম
                    </h2>
                </Reveal>

                <RevealGroup className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {steps.map(({ step, title, description, image }) => (
                        <RevealItem key={step}>
                            <TiltCard
                                strength={8}
                                className="relative overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-amber-900/10"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={image}
                                        alt={title}
                                        className="size-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 to-transparent" />
                                    <span className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-full bg-stone-950 font-bengali text-sm font-bold text-amber-300 shadow-lg">
                                        {step}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bengali text-lg font-semibold text-stone-900">
                                        {title}
                                    </h3>
                                    <p className="mt-1 font-bengali text-sm text-stone-600">
                                        {description}
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
