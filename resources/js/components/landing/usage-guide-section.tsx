import { useRef, useState } from 'react';
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useScroll,
} from 'motion/react';
import cleanseImg from '../../../images/landing/cards/usage-cleanse.webp';
import dispenseImg from '../../../images/landing/cards/usage-dispense.webp';
import massageImg from '../../../images/landing/cards/usage-massage.webp';
import routineImg from '../../../images/landing/cards/usage-routine.webp';
import Reveal from './motion/reveal';

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
    const sectionRef = useRef<HTMLElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });

    useMotionValueEvent(scrollYProgress, 'change', (progress) => {
        const nextStep = Math.min(
            steps.length - 1,
            Math.floor(progress * steps.length),
        );

        setActiveStep(nextStep);
    });

    const { step, title, description, image } = steps[activeStep];
    const fromLeft = activeStep % 2 === 0;

    return (
        <section
            ref={sectionRef}
            id="usage"
            className="relative h-[400svh] scroll-mt-24 bg-gradient-to-b from-white via-amber-50 to-white"
        >
            <div className="sticky top-24 flex h-[calc(100svh-12rem)] flex-col overflow-hidden px-4 sm:px-6">
                <Reveal className="mx-auto w-full max-w-5xl pt-5 text-center sm:pt-12">
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-sm font-semibold tracking-wide text-amber-800 sm:text-base">
                        সঠিক ব্যবহার পদ্ধতি
                    </span>
                    <h2 className="mt-2 font-bengali text-3xl font-bold text-stone-900 sm:text-4xl">
                        ব্যবহারের নিয়ম
                    </h2>
                </Reveal>

                <div className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center pb-8">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, x: fromLeft ? -48 : 48 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: fromLeft ? 48 : -48 }}
                            transition={{
                                duration: 0.45,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            aria-live="polite"
                            className={`flex w-full flex-col items-center gap-4 sm:gap-8 lg:flex-row lg:gap-12 ${
                                fromLeft ? '' : 'lg:flex-row-reverse'
                            }`}
                        >
                            <div className="relative aspect-square w-[min(68vw,28svh)] max-w-sm shrink-0 overflow-hidden rounded-[2.5rem] border border-amber-200 bg-white/80 shadow-2xl shadow-amber-900/20 lg:w-96">
                                <img
                                    src={image}
                                    alt={title}
                                    className="size-full object-contain p-3"
                                />
                                <span className="absolute top-4 left-4 flex size-14 items-center justify-center rounded-2xl bg-stone-950/90 font-bengali text-xl font-bold text-amber-300 shadow-lg backdrop-blur-sm">
                                    {step}
                                </span>
                            </div>

                            <div
                                className={`w-full flex-1 text-center lg:text-left ${
                                    fromLeft ? '' : 'lg:text-right'
                                }`}
                            >
                                <h3 className="font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                                    {title}
                                </h3>
                                <p className="mx-auto mt-3 max-w-md font-bengali text-lg leading-relaxed text-stone-700 sm:text-xl lg:mx-0">
                                    {description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
