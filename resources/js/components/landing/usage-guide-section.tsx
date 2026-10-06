import { ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import cleanseImg from '../../../images/landing/cards/usage-clean-area-full.webp';
import dispenseImg from '../../../images/landing/cards/usage-amount-full.webp';
import massageImg from '../../../images/landing/cards/usage-massage-full.webp';
import routineImg from '../../../images/landing/cards/usage-routine-full.webp';
import Reveal from './motion/reveal';
import TiltCard from './motion/tilt-card';
import OrderButton from './order-button';

const steps = [
    {
        step: '১',
        title: 'ক্লিনজ',
        description:
            'যেখানে ব্যথা বা অস্বস্তি অনুভব করছেন, সেই স্থানটি হালকা গরম পানি ও পরিষ্কার কাপড় দিয়ে মুছে নিন। ত্বক ধুলো-ময়লা ও ঘাম মুক্ত থাকলে অয়েল দ্রুত শোষিত হয় এবং কার্যকারিতা অনেক বেড়ে যায়।',
        tip: 'গোসলের পরপরই ব্যবহার করলে ত্বক স্বাভাবিকভাবেই পরিষ্কার ও নরম থাকে।',
        image: cleanseImg,
    },
    {
        step: '২',
        title: 'পরিমাণমতো নিন',
        description:
            'হাতের তালুতে ২-৩ ফোঁটা অথবা প্রয়োজনমতো অয়েল নিন। বেশি পরিমাণে নেওয়ার প্রয়োজন নেই — অল্প পরিমাণ অয়েলই আক্রান্ত স্থানে পর্যাপ্ত আরাম দিতে যথেষ্ট।',
        tip: 'অয়েল হাতের তালুতে কয়েক সেকেন্ড ঘষে নিলে প্রয়োগ করা আরও সহজ হয়।',
        image: dispenseImg,
    },
    {
        step: '৩',
        title: 'আলতো ম্যাসাজ',
        description:
            'বৃত্তাকার ভঙ্গিতে ৩-৫ মিনিট আলতোভাবে ম্যাসাজ করুন, যতক্ষণ না অয়েল সম্পূর্ণভাবে ত্বকে শোষিত হয়ে যায়। অতিরিক্ত চাপ না দিয়ে স্বাভাবিক হাতে ম্যাসাজ করাই যথেষ্ট।',
        tip: 'ম্যাসাজের সময় গভীর শ্বাস নিলে পেশি আরও দ্রুত শিথিল হয়।',
        image: massageImg,
    },
    {
        step: '৪',
        title: 'নিয়মিত ব্যবহার',
        description:
            'ভালো ও দীর্ঘস্থায়ী ফলাফলের জন্য দিনে ২-৩ বার নিয়মিত ব্যবহার করুন। একটানা ব্যবহারে ধীরে ধীরে উপকার আরও স্পষ্টভাবে বোঝা যেতে শুরু করে।',
        tip: 'ঘুমানোর আগে একবার ব্যবহার করলে সারারাত আরাম পাওয়া যায়।',
        image: routineImg,
    },
];

export default function UsageGuideSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-120px' });

    const [activeStep, setActiveStep] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextStep = useCallback(() => {
        setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, []);

    const prevStep = useCallback(() => {
        setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));
    }, []);

    // Auto-advance steps once the section has scrolled into view, unless the user interacts
    useEffect(() => {
        if (isPaused || !isInView) return;
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
    }, [isPaused, isInView]);

    const current = steps[activeStep];
    const isLastStep = activeStep === steps.length - 1;

    return (
        <section
            id="usage"
            ref={sectionRef}
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-white via-amber-50/60 to-white py-14 select-none sm:py-24"
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
                    <p className="mx-auto mt-4 max-w-2xl font-bengali text-sm leading-relaxed text-stone-600 sm:text-base">
                        মাত্র ৪টি সহজ ধাপে আবাবিল ব্যবহার করে পেতে পারেন ব্যথা থেকে প্রকৃত
                        আরাম। সর্বোচ্চ ফলাফলের জন্য নিচের প্রতিটি ধাপ ধারাবাহিকভাবে অনুসরণ
                        করুন — ধাপগুলো যত নিয়মিত মেনে চলবেন, উপকারও তত দ্রুত ও
                        দীর্ঘস্থায়ী হবে।
                    </p>
                </Reveal>

                {/* Step Selector Tabs (১, ২, ৩, ৪) */}
                <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
                    {steps.map((item, idx) => (
                        <button
                            key={item.step}
                            type="button"
                            onClick={() => setActiveStep(idx)}
                            className={`flex size-11 items-center justify-center rounded-2xl font-bengali text-base font-bold shadow-md transition-all duration-300 sm:size-14 sm:text-xl ${
                                idx === activeStep
                                    ? 'scale-110 bg-amber-400 text-stone-950 ring-4 shadow-amber-500/30 ring-amber-300/50'
                                    : 'border border-amber-200 bg-white text-stone-700 hover:bg-amber-100'
                            }`}
                        >
                            {item.step}
                        </button>
                    ))}
                </div>

                {/* Liquid Fast Scaled Step Card Container */}
                <div className="mt-10 flex flex-col items-center sm:mt-14">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1.05, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="w-[92vw] max-w-4xl"
                        >
                            <TiltCard
                                strength={6}
                                className="relative overflow-hidden rounded-3xl border-2 border-amber-200/90 bg-white p-5 shadow-2xl shadow-amber-900/15 sm:p-8 lg:p-10"
                            >
                                <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:gap-12">
                                    {/* Large Scaled Image Container (Fills Mobile, Scaled up on Desktop) */}
                                    <div className="group relative aspect-square w-full max-w-md shrink-0 overflow-hidden rounded-2xl border-2 border-amber-100 bg-stone-900 shadow-inner lg:w-1/2">
                                        <img
                                            src={current.image}
                                            alt={current.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 text-center lg:text-left">
                                        <h3 className="font-bengali text-2xl font-extrabold text-stone-900 sm:text-3xl lg:text-4xl">
                                            {current.title}
                                        </h3>
                                        <p className="mt-4 font-bengali text-base leading-relaxed text-stone-700 sm:text-lg lg:text-xl">
                                            {current.description}
                                        </p>

                                        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-left">
                                            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                                            <p className="font-bengali text-sm leading-relaxed text-amber-900">
                                                {current.tip}
                                            </p>
                                        </div>

                                        {/* Step Control Buttons */}
                                        <div className="mt-8 flex items-center justify-center gap-4 lg:justify-start">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                disabled={activeStep === 0}
                                                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 font-bengali text-sm font-semibold text-stone-800 transition hover:bg-amber-400 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ChevronLeft className="size-4" />
                                                পূর্ববর্তী
                                            </button>

                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={isLastStep}
                                                className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 font-bengali text-sm font-bold text-stone-950 shadow-md transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                পরবর্তী
                                                <ChevronRight className="size-4" />
                                            </button>
                                        </div>

                                        <div className="mt-6 flex justify-center lg:justify-start">
                                            <OrderButton size="lg">
                                                এখনই অর্ডার করুন
                                            </OrderButton>
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
