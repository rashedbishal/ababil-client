import {
    motion,
    type MotionValue,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from 'motion/react';
import { useRef, useState } from 'react';
import warmingImg from '../../../images/landing/cards/usp-warming-original.webp';
import nonstickyImg from '../../../images/landing/cards/usp-nonsticky-original.webp';
import massageImg from '../../../images/landing/cards/usp-massage-original.webp';
import skincareImg from '../../../images/landing/cards/usp-skincare-original.webp';
import arnicaImg from '../../../images/landing/cards/usp-herbal-original.webp';
import vitamineImg from '../../../images/landing/cards/usp-absorption-original.webp';
import TiltCard from './motion/tilt-card';

const bnDigits = ['১', '২', '৩', '৪', '৫', '৬'];

const usps = [
    {
        title: 'থেরাপিউটিক ওয়ার্মিং',
        description: 'ত্বকে প্রাকৃতিক উষ্ণতা তৈরি করে পেশি শিথিল করে।',
        image: warmingImg,
    },
    {
        title: 'নন-স্টিকি ড্রাই ফর্মুলা',
        description: 'ব্যবহারের পর কোনো আঠালো বা তৈলাক্ত ভাব থাকে না।',
        image: nonstickyImg,
    },
    {
        title: 'দ্রুত শোষণ',
        description: 'মাত্র ২-৩ মিনিটেই ত্বকে সম্পূর্ণ শোষিত হয়ে যায়।',
        image: vitamineImg,
    },
    {
        title: 'সহজ ম্যাসাজ',
        description: 'মসৃণ টেক্সচারের কারণে সহজেই ম্যাসাজ করা যায়।',
        image: massageImg,
    },
    {
        title: 'হারবাল ফর্মুলেশন',
        description: '৯টি প্রাকৃতিক ভেষজ উপাদানের অনন্য সংমিশ্রণ।',
        image: arnicaImg,
    },
    {
        title: 'স্কিন কেয়ার',
        description: 'ত্বকের বিবর্ণতা কমাতে সাহায্য করে, অ্যালার্জিক ত্বকেও নিরাপদ।',
        image: skincareImg,
    },
];

const titleSettleProgress = 0.06;

// Maps linear time to a sweep position. Speed is 1 - 0.8·sin(πt): slow but
// moving on entry and exit, slowest at the centre (about a fifth of the entry
// speed), and never zero, so the card keeps drifting through the middle.
const SWEEP_AMPLITUDE = 0.8;
const sweepTotal = 1 - (2 * SWEEP_AMPLITUDE) / Math.PI;
const sweepPace = (t: number) =>
    (t - (SWEEP_AMPLITUDE * (1 - Math.cos(Math.PI * t))) / Math.PI) /
    sweepTotal;

function UspSlide({
    item,
    index,
    progress,
    active,
}: {
    item: (typeof usps)[number];
    index: number;
    progress: MotionValue<number>;
    active: boolean;
}) {
    const itemRange = (1 - titleSettleProgress) / usps.length;
    const itemProgress = useTransform(progress, (value) =>
        sweepPace(
            Math.min(
                1,
                Math.max(
                    0,
                    (value - titleSettleProgress - index * itemRange) /
                        itemRange,
                ),
            ),
        ),
    );
    // Position moves continuously across the whole slot, so the card never
    // stops. Only the fades use the entry and exit windows.
    const x = useTransform(itemProgress, [0, 1], ['100%', '-100%']);
    const opacity = useTransform(itemProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
    const scale = useTransform(itemProgress, [0, 0.5, 1], [0.98, 1, 1.03]);

    return (
        <motion.div
            style={{ x, opacity, scale }}
            aria-hidden={!active}
            className={`absolute inset-0 flex flex-col items-center justify-center pt-32 pb-4 text-center sm:pb-8 ${
                active ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
        >
            <div className="group relative">
                <div
                    aria-hidden
                    className="absolute -inset-7 rounded-full bg-gradient-to-br from-amber-400/40 via-yellow-300/20 to-transparent opacity-80 blur-2xl transition-opacity duration-1000 group-hover:opacity-100"
                />
                <div
                    aria-hidden
                    className="animate-border-spin absolute -inset-2 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(251,191,36,0.95)_10%,transparent_26%,transparent_100%)] opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
                />
                <TiltCard
                    strength={8}
                    glare={false}
                    className="relative flex size-[min(78vw,48svh)] max-w-md items-center justify-center rounded-full border-4 border-amber-200 bg-white p-0 shadow-2xl shadow-amber-900/20 transition-shadow duration-1000 group-hover:shadow-amber-500/30"
                >
                    <motion.img
                        src={item.image}
                        alt=""
                        className="size-[70%] rounded-xl object-contain"
                    />
                </TiltCard>
                <span className="absolute right-0 bottom-0 flex size-11 items-center justify-center rounded-full border-4 border-amber-50 bg-stone-950 font-bengali text-sm font-bold text-amber-300 shadow-lg sm:size-14 sm:text-lg">
                    {bnDigits[index]}
                </span>
            </div>

            <h3 className="mt-8 font-bengali text-xl font-bold text-stone-900 sm:text-2xl">
                {item.title}
            </h3>
            <p className="mt-2 max-w-xs font-bengali text-sm text-stone-600 sm:text-base">
                {item.description}
            </p>
        </motion.div>
    );
}

export default function UspSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });
    const progress = useSpring(scrollYProgress, {
        stiffness: 40,
        damping: 26,
        mass: 1,
        restDelta: 0.001,
    });
    const titleFontSize = useTransform(
        progress,
        [0, titleSettleProgress],
        ['clamp(2.5rem, 7vw, 4.5rem)', 'clamp(2rem, 4vw, 3rem)'],
    );
    const titleTop = useTransform(
        progress,
        [0, titleSettleProgress],
        ['50%', '0%'],
    );
    const titleOffset = useTransform(
        progress,
        [0, titleSettleProgress],
        ['-50%', '0%'],
    );
    const contentOpacity = useTransform(progress, (value) =>
        Math.min(1, Math.max(0, value / titleSettleProgress)),
    );
    const contentY = useTransform(
        progress,
        (value) =>
            36 * (1 - Math.min(1, Math.max(0, value / titleSettleProgress))),
    );

    useMotionValueEvent(progress, 'change', (value) => {
        const itemProgress = Math.max(
            0,
            (value - titleSettleProgress) / (1 - titleSettleProgress),
        );
        const nextIndex = Math.min(
            usps.length - 1,
            Math.floor(itemProgress * usps.length + 0.01),
        );

        setActiveIndex(nextIndex);
    });

    return (
        <section
            ref={sectionRef}
            id="usp"
            className="relative h-[6000svh] scroll-mt-24 bg-gradient-to-b from-amber-50 to-amber-100/60"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.15),transparent_50%)]"
            />
            <div className="relative sticky top-24 flex h-[calc(100svh-12rem)] flex-col overflow-hidden px-4 sm:px-6">
                <motion.h2
                    style={{
                        top: titleTop,
                        y: titleOffset,
                        fontSize: titleFontSize,
                    }}
                    className="absolute inset-x-4 z-10 mx-auto w-auto max-w-5xl text-center font-bengali leading-tight font-bold text-stone-900"
                >
                    কেন আবাবিল বেছে নেবেন
                </motion.h2>

                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="relative mx-auto flex w-full max-w-none flex-1 items-center justify-center overflow-hidden"
                >
                    {usps.map((item, index) => (
                        <UspSlide
                            key={item.title}
                            item={item}
                            index={index}
                            progress={progress}
                            active={index === activeIndex}
                        />
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
