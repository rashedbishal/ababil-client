import {
    AnimatePresence,
    motion,
    useAnimationFrame,
    useMotionValue,
    useTransform,
    type MotionValue,
} from 'motion/react';
import { Leaf } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import angelicaImg from '../../../images/landing/cards/ing-angelica.webp';
import arnicaImg from '../../../images/landing/cards/ing-arnica.webp';
import boswelliaImg from '../../../images/landing/cards/ing-boswellia.webp';
import neroliImg from '../../../images/landing/cards/ing-neroli.webp';
import teatreeImg from '../../../images/landing/cards/ing-teatree.webp';
import vitamineImg from '../../../images/landing/cards/ing-vitamine.webp';
import Reveal from './motion/reveal';

const ingredients = [
    { name: 'বোসওয়েলিয়া তেল', image: boswelliaImg },
    { name: 'আর্নিকা তেল', image: arnicaImg },
    { name: 'নেরোলি তেল', image: neroliImg },
    { name: 'চুয়ানক্সিয়ং তেল', image: null },
    { name: 'অ্যাঞ্জেলিকা তেল', image: angelicaImg },
    { name: 'লরোক্যাপ্রাম', image: null },
    { name: 'টি ট্রি তেল', image: teatreeImg },
    { name: 'ইউক্যালিপটাস তেল', image: null },
    { name: 'ভিটামিন-ই তেল', image: vitamineImg },
];

const total = ingredients.length;
const revolutionSeconds = 48;

function circularOffset(index: number, progress: number) {
    const raw = index - progress;
    return ((((raw + total / 2) % total) + total) % total) - total / 2;
}

function IngredientOrb({
    progress,
    index,
    name,
    image,
}: {
    progress: MotionValue<number>;
    index: number;
    name: string;
    image: string | null;
}) {
    const diff = useTransform(progress, (p) => circularOffset(index, p));
    const x = useTransform(diff, (d) => `calc(-50% + ${d} * min(22vw, 140px))`);
    const scale = useTransform(diff, (d) =>
        Math.max(1.45 - Math.abs(d) * 0.2, 0.55),
    );
    const opacity = useTransform(diff, (d) =>
        Math.max(1 - Math.abs(d) * 0.1, 0.45),
    );
    const rotateY = useTransform(diff, (d) => d * -14);
    const zIndex = useTransform(diff, (d) => Math.round(20 - Math.abs(d) * 2));
    const glow = useTransform(diff, (d) => (Math.abs(d) < 0.5 ? 1 : 0));

    return (
        <motion.div
            style={{ x, y: '-50%', scale, opacity, rotateY, zIndex }}
            className="absolute top-1/2 left-1/2 size-16 shrink-0 sm:size-20 lg:size-24"
        >
            <div className="relative size-full">
                <motion.div
                    aria-hidden
                    style={{ opacity: glow }}
                    className="absolute -inset-4 rounded-full bg-gradient-to-br from-amber-400/50 via-yellow-300/20 to-transparent blur-2xl"
                />
                <div className="relative size-full overflow-hidden rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-100 to-amber-50 shadow-2xl shadow-amber-900/20">
                    {image ? (
                        <img
                            src={image}
                            alt={name}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-amber-500">
                            <Leaf className="size-7 lg:size-9" />
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function IngredientsSection() {
    const progress = useMotionValue(0);
    const [labelIndex, setLabelIndex] = useState(0);
    const lastIndexRef = useRef(0);

    useAnimationFrame((_, delta) => {
        progress.set(
            progress.get() + (delta / 1000) * (total / revolutionSeconds),
        );
    });

    useEffect(() => {
        return progress.on('change', (v) => {
            const idx = Math.round(((v % total) + total) % total) % total;

            if (idx !== lastIndexRef.current) {
                lastIndexRef.current = idx;
                setLabelIndex(idx);
            }
        });
    }, [progress]);

    return (
        <section
            id="ingredients"
            className="scroll-mt-24 overflow-hidden bg-white py-14 sm:py-20"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        ৯টি বিশ্বমানের প্রাকৃতিক উপাদান
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-center font-bengali text-sm text-stone-600">
                        প্রতিটি উপাদান সতর্কতার সাথে নির্বাচিত, যা একসাথে কাজ করে দ্রুত ও
                        কার্যকর ব্যথা উপশমের জন্য।
                    </p>
                </Reveal>

                <Reveal delay={0.1} className="relative mt-12">
                    <div
                        style={{ perspective: '1600px' }}
                        className="relative flex h-32 items-center justify-center overflow-x-hidden sm:h-40 lg:h-48"
                    >
                        {ingredients.map(({ name, image }, i) => (
                            <IngredientOrb
                                key={name}
                                progress={progress}
                                index={i}
                                name={name}
                                image={image}
                            />
                        ))}
                    </div>

                    <div className="mt-8 h-8 text-center">
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={labelIndex}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="font-bengali text-lg font-bold text-stone-900 sm:text-xl"
                            >
                                {ingredients[labelIndex].name}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
