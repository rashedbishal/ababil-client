import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import cleanseImg from '../../../images/landing/cards/usage-clean-area-full.webp';
import dispenseImg from '../../../images/landing/cards/usage-amount-full.webp';
import massageImg from '../../../images/landing/cards/usage-massage-full.webp';
import routineImg from '../../../images/landing/cards/usage-routine-full.webp';
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
    const [activeStep, setActiveStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextStep = useCallback(() => {
        setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, []);

    const prevStep = useCallback(() => {
        setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    // Auto-advance steps unless user interacts
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setActiveStep((prev) => {
                // Advance step; on last step (step 4), keep it remaining as requested
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 4000);
        return () => clearInterval(timer);
    }, [isPaused]);

    const current = steps[activeStep];
    const isLastStep = activeStep === steps.length - 1;

    return (
        <section
            id="usage"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-amber-50/60 to-white py-14 sm:py-24 select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Ambient Glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(251,191,36,0.1)_100%)]"
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                {/* Clean, Simple, Static Header (Intro Sequence Removed) */}
                <Reveal className="text-center">
                    <span className="mx-auto inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800 sm:text-sm">
                        সঠিক ব্যবহার পদ্ধতি
                    </span>
                    <h2 className="mt-3 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
                        ব্যবহারের নিয়ম
                    </h2>
                </Reveal>

                {/* Step Selector Tabs (১, ২, ৩, ৪) */}
                <div className="mt-8 flex justify-center items-center gap-3 sm:gap-4">
                    {steps.map((item, idx) => (
                        <button
                            key={item.step}
                            type="button"
                            onClick={() => setActiveStep(idx)}
                            className={`flex size-11 sm:size-14 items-center justify-center rounded-2xl font-bengali text-base sm:text-xl font-bold transition-all duration-300 shadow-md ${
                                idx === activeStep
                                    ? 'bg-amber-400 text-stone-950 scale-110 ring-4 ring-amber-300/50 shadow-amber-500/30'
                                    : 'bg-white text-stone-700 hover:bg-amber-100 border border-amber-200'
                            }`}
                        >
                            {item.step}
                        </button>
                    ))}
                </div>

                {/* Liquid Fast Scaled Step Card Container */}
                <div className="mt-10 sm:mt-14 flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1.05, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="w-[92vw] max-w-4xl"
                        >
                            <TiltCard
                                strength={6}
                                className="relative overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-white p-5 sm:p-8 lg:p-10 shadow-2xl shadow-amber-900/15"
                            >
                                <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12">
                                    {/* Large Scaled Image Container (Fills Mobile, Scaled up on Desktop) */}
                                    <div className="relative w-full lg:w-1/2 aspect-square max-w-md shrink-0 overflow-hidden rounded-2xl border-2 border-amber-100 bg-stone-900 shadow-inner group">
                                        <img
                                            src={current.image}
                                            alt={current.title}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <span className="absolute top-4 left-4 flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-stone-950/90 font-bengali text-xl sm:text-2xl font-bold text-amber-300 shadow-xl border border-amber-400/30">
                                            ধাপ {current.step}
                                        </span>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <span className="font-bengali text-xs font-semibold text-amber-600 uppercase tracking-widest">
                                            ধাপ {current.step} / ৪
                                        </span>
                                        <h3 className="mt-2 font-bengali text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900">
                                            {current.title}
                                        </h3>
                                        <p className="mt-4 font-bengali text-base sm:text-lg lg:text-xl leading-relaxed text-stone-700">
                                            {current.description}
                                        </p>

                                        {/* Step Control Buttons */}
                                        <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                disabled={activeStep === 0}
                                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 font-bengali text-sm font-semibold text-stone-800 transition hover:bg-amber-400 hover:text-stone-950 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="size-4" />
                                                পূর্ববর্তী
                                            </button>

                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={isLastStep}
                                                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-400 font-bengali text-sm font-bold text-stone-950 shadow-md transition hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                পরবর্তী
                                                <ChevronRight className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
