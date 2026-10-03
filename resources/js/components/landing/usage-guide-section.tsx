import { useRef, useState } from 'react';
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from 'motion/react';
import cleanseImg from '../../../images/landing/cards/usage-clean-area-full.webp';
import dispenseImg from '../../../images/landing/cards/usage-amount-full.webp';
import massageImg from '../../../images/landing/cards/usage-massage-full.webp';
import routineImg from '../../../images/landing/cards/usage-routine-full.webp';

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

const titleSettleProgress = 0.1;

export default function UsageGuideSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeStep, setActiveStep] = useState(0);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });
    const smoothScrollProgress = useSpring(scrollYProgress, {
        stiffness: 125,
        damping: 28,
        mass: 0.7,
        restDelta: 0.001,
    });
    const titleFontSize = useTransform(
        smoothScrollProgress,
        [0, titleSettleProgress],
        ['clamp(2.5rem, 6vw, 4rem)', 'clamp(2rem, 4vw, 3rem)'],
    );
    const titleTop = useTransform(
        smoothScrollProgress,
        [0, titleSettleProgress],
        ['50%', '0%'],
    );
    const titleOffset = useTransform(
        smoothScrollProgress,
        [0, titleSettleProgress],
        ['-50%', '0%'],
    );
    const contentOpacity = useTransform(smoothScrollProgress, (progress) =>
        Math.min(1, Math.max(0, progress / titleSettleProgress)),
    );
    const contentY = useTransform(
        smoothScrollProgress,
        (progress) =>
            36 * (1 - Math.min(1, Math.max(0, progress / titleSettleProgress))),
    );

    useMotionValueEvent(smoothScrollProgress, 'change', (progress) => {
        const stepProgress = Math.max(
            0,
            (progress - titleSettleProgress) / (1 - titleSettleProgress),
        );
        const nextStep = Math.min(
            steps.length - 1,
            Math.floor(stepProgress * steps.length + 0.01),
        );

        setActiveStep(nextStep);
    });

    const { step, title, description, image } = steps[activeStep];
    const fromLeft = activeStep % 2 === 0;
    const stepRange = (1 - titleSettleProgress) / steps.length;
    const stepStart = titleSettleProgress + activeStep * stepRange;
    const stepProgress = useTransform(smoothScrollProgress, (progress) =>
        Math.min(1, Math.max(0, (progress - stepStart) / stepRange)),
    );
    const stepOpacity = useTransform(
        stepProgress,
        [0, 0.12, 0.3, 0.7, 0.9, 1],
        [0.08, 0.6, 1, 1, 0.6, 0.08],
    );
    const stepScale = useTransform(
        stepProgress,
        [0, 0.32, 0.82, 1],
        [0.96, 1, 1.05, 1.08],
    );
    const stepX = useTransform(
        stepProgress,
        [0, 0.32, 0.82, 1],
        [fromLeft ? -24 : 24, 0, 0, fromLeft ? 8 : -8],
    );

    return (
        <section
            ref={sectionRef}
            id="usage"
            className="relative h-[1800svh] scroll-mt-24 bg-gradient-to-b from-white via-amber-50 to-white"
        >
            <div className="relative sticky top-24 flex h-[calc(100svh-12rem)] flex-col overflow-hidden px-4 sm:px-6">
                <motion.div
                    style={{ top: titleTop, y: titleOffset }}
                    className="absolute inset-x-4 z-10 mx-auto max-w-5xl text-center"
                >
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-sm font-semibold tracking-wide text-amber-800 sm:text-base">
                        সঠিক ব্যবহার পদ্ধতি
                    </span>
                    <motion.h2
                        style={{ fontSize: titleFontSize }}
                        className="mt-2 font-bengali leading-tight font-bold text-stone-900"
                    >
                        ব্যবহারের নিয়ম
                    </motion.h2>
                </motion.div>

                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center pt-16 pb-4 sm:pt-20 sm:pb-8"
                >
                    <motion.div
                        style={{
                            opacity: stepOpacity,
                            scale: stepScale,
                            x: stepX,
                        }}
                        className="w-full"
                    >
                        <motion.div
                            aria-live="polite"
                            className={`flex w-full flex-col items-center gap-4 sm:gap-8 lg:flex-row lg:gap-12 ${
                                fromLeft ? '' : 'lg:flex-row-reverse'
                            }`}
                        >
                            <div className="relative aspect-square w-[min(68vw,28svh)] max-w-sm shrink-0 overflow-hidden rounded-[2.5rem] border border-amber-200 bg-white/80 shadow-2xl shadow-amber-900/20 lg:w-[min(68vw,40svh)]">
                                <img
                                    src={image}
                                    alt={title}
                                    className="size-full rounded-[2.4rem] object-contain"
                                />
                                <span className="absolute top-3 left-3 flex size-9 items-center justify-center rounded-xl bg-stone-950/90 font-bengali text-base font-bold text-amber-300 shadow-lg backdrop-blur-sm sm:top-4 sm:left-4 sm:size-12 sm:rounded-2xl sm:text-xl">
                                    {step}
                                </span>
                            </div>

                            <div
                                className={`w-full flex-1 text-center ${
                                    fromLeft ? 'lg:text-left' : 'lg:text-right'
                                }`}
                            >
                                <h3 className="font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                                    {title}
                                </h3>
                                <p
                                    className={`mx-auto mt-3 w-full max-w-md font-bengali text-lg leading-relaxed text-stone-700 sm:text-xl ${
                                        fromLeft
                                            ? 'lg:mx-0 lg:text-left'
                                            : 'lg:mr-0 lg:ml-auto lg:text-right'
                                    }`}
                                >
                                    {description}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
