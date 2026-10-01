import { motion } from 'motion/react';
import cleanseImg from '../../../images/landing/cards/usage-cleanse.webp';
import dispenseImg from '../../../images/landing/cards/usage-dispense.webp';
import massageImg from '../../../images/landing/cards/usage-massage.webp';
import routineImg from '../../../images/landing/cards/usage-routine.webp';
import Reveal from './motion/reveal';
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
        <section
            id="usage"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-amber-50 to-white py-16 sm:py-24"
        >
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800">
                        সঠিক ব্যবহার পদ্ধতি
                    </span>
                    <h2 className="mt-4 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
                        ব্যবহারের নিয়ম
                    </h2>
                </Reveal>

                <div className="relative mt-16 space-y-20 sm:mt-24 sm:space-y-28">
                    <div
                        aria-hidden
                        className="absolute inset-y-0 left-1/2 hidden w-1 -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-200 lg:block"
                    />

                    {steps.map(({ step, title, description, image }, i) => {
                        const fromLeft = i % 2 === 0;

                        return (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: fromLeft ? -80 : 80 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{
                                    once: true,
                                    margin: '0px 0px -100px 0px',
                                }}
                                transition={{
                                    duration: 1.05,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className={`group relative flex flex-col items-center gap-8 lg:flex-row lg:gap-12 ${
                                    fromLeft ? '' : 'lg:flex-row-reverse'
                                }`}
                            >
                                <span
                                    aria-hidden
                                    className="absolute top-1/2 left-1/2 z-10 hidden size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-amber-50 bg-amber-500 shadow-[0_0_0_6px_rgba(251,191,36,0.25)] lg:block"
                                />

                                <div className="relative w-full max-w-sm shrink-0 lg:w-96">
                                    <div
                                        aria-hidden
                                        className="absolute -inset-3 rounded-[2.75rem] bg-gradient-to-br from-amber-300/50 to-transparent opacity-80 blur-xl transition-opacity duration-500 group-hover:opacity-100"
                                    />
                                    <TiltCard
                                        strength={6}
                                        className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-amber-200 shadow-2xl shadow-amber-900/20 transition-shadow duration-500 group-hover:shadow-amber-500/30"
                                    >
                                        <motion.img
                                            src={image}
                                            alt={title}
                                            whileHover={{ scale: 1.07 }}
                                            transition={{
                                                duration: 0.8,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                            className="size-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent" />
                                        <span className="absolute top-5 left-5 flex size-14 items-center justify-center rounded-2xl bg-stone-950/90 font-bengali text-xl font-bold text-amber-300 shadow-lg backdrop-blur-sm">
                                            {step}
                                        </span>
                                    </TiltCard>
                                </div>

                                <div
                                    className={`flex-1 text-center lg:text-left ${
                                        fromLeft ? '' : 'lg:text-right'
                                    }`}
                                >
                                    <h3 className="font-bengali text-xl font-bold text-stone-900 sm:text-2xl">
                                        {title}
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-md font-bengali text-sm text-stone-600 sm:text-base lg:mx-0">
                                        {description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
