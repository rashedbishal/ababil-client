import {
    motion,
    type MotionValue,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
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

const titleSettleProgress = 0.02;
// Negative start: the first card is already partly on screen at the top.
const slidesStart = -0.06;
// Scroll distance (in slot units) between one card and the next.
const slideStep = (1 - slidesStart) / (usps.length - 1);
const CARD_GAP = 16;
const MAX_CARD = 448;

// Distance between card centres: the circle's size plus a small gap, so cards
// sit one right after another. Measured from the viewport, matching the
// circle's min(70vw, 40svh) size with its max width.
function getSpacing() {
    if (typeof window === 'undefined') {
        return 300;
    }

    const size = Math.min(
        0.7 * window.innerWidth,
        0.4 * window.innerHeight,
        MAX_CARD,
    );

    return size + CARD_GAP;
}

function UspSlide({
    item,
    index,
    position,
    spacing,
    active,
}: {
    item: (typeof usps)[number];
    index: number;
    position: MotionValue<number>;
    spacing: number;
    active: boolean;
}) {
    // position is the scroll position in card units; 0 means card 0 is centred.
    const x = useTransform(position, (value) => (index - value) * spacing);
    const scale = useTransform(position, (value) => {
        const distance = Math.min(1, Math.abs(index - value));
        return 1.2 - 0.5 * distance;
    });
    const opacity = useTransform(position, (value) => {
        const distance = Math.abs(index - value);
        return Math.max(0.3, 1 - 0.4 * distance);
    });

    return (
        <motion.div
            style={{
                x,
                scale,
                opacity,
                width: spacing - CARD_GAP,
                left: '50%',
                marginLeft: -(spacing - CARD_GAP) / 2,
            }}
            aria-hidden={!active}
            className={`absolute inset-y-0 flex flex-col items-center justify-center pt-20 pb-8 text-center will-change-transform sm:pb-12 ${
                active ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
        >
            <div className="group relative">
                <div
                    aria-hidden
                    className="absolute -inset-7 hidden rounded-full bg-gradient-to-br from-amber-400/40 via-yellow-300/20 to-transparent opacity-80 blur-2xl transition-opacity duration-1000 group-hover:opacity-100 sm:block"
                />
                <div
                    aria-hidden
                    className="animate-border-spin absolute -inset-2 hidden rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(251,191,36,0.95)_10%,transparent_26%,transparent_100%)] opacity-0 transition-opacity duration-1000 group-hover:opacity-100 sm:block"
                />
                <TiltCard
                    strength={8}
                    glare={false}
                    className="relative flex size-[min(70vw,40svh)] max-w-md items-center justify-center rounded-full border-4 border-amber-200 bg-white p-0 shadow-lg shadow-amber-900/20 transition-shadow duration-1000 group-hover:shadow-amber-500/30 sm:shadow-2xl"
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
    const [spacing, setSpacing] = useState(getSpacing);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start start', 'end end'],
    });
    // Raw scroll progress, so the slide follows the finger one-to-one.
    const progress = scrollYProgress;
    // Scroll position in card units, shared by every card.
    const position = useTransform(progress, (value) =>
        Math.min(
            usps.length - 1,
            Math.max(0, (value - slidesStart) / slideStep),
        ),
    );
    // Scale instead of animating font-size, which relayouts on every scroll frame.
    const titleScale = useTransform(
        progress,
        [0, titleSettleProgress],
        [1.3, 1],
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

    useMotionValueEvent(position, 'change', (value) => {
        setActiveIndex(Math.min(usps.length - 1, Math.round(value)));
    });

    useEffect(() => {
        const onResize = () => setSpacing(getSpacing());

        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <section
            ref={sectionRef}
            id="usp"
            className="relative h-[700svh] scroll-mt-24 bg-gradient-to-b from-amber-50 to-amber-100/60"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.15),transparent_50%)]"
            />
            <div className="relative sticky top-24 flex h-[calc(100svh-6rem)] flex-col overflow-hidden px-4 sm:px-6">
                <motion.h2
                    style={{
                        top: titleTop,
                        y: titleOffset,
                        scale: titleScale,
                    }}
                    className="absolute inset-x-4 z-10 mx-auto w-auto max-w-5xl text-center font-bengali text-[clamp(2rem,4vw,3rem)] leading-tight font-bold text-stone-900"
                >
                    কেন আবাবিল বেছে নেবেন
                </motion.h2>

                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="relative mx-auto flex w-full max-w-none flex-1 items-center justify-center overflow-hidden"
                >
                    {/* Only cards near the centre are mounted; the rest are off-screen. */}
                    {usps.map((item, index) =>
                        Math.abs(index - activeIndex) <= 2 ? (
                            <UspSlide
                                key={item.title}
                                item={item}
                                index={index}
                                position={position}
                                spacing={spacing}
                                active={index === activeIndex}
                            />
                        ) : null,
                    )}
                </motion.div>
            </div>
        </section>
    );
}
