import { motion } from 'motion/react';
import backImg from '../../../images/landing/cards/problem-back.webp';
import feetImg from '../../../images/landing/cards/problem-feet.webp';
import kneeImg from '../../../images/landing/cards/problem-knee.webp';
import muscleImg from '../../../images/landing/cards/problem-muscle.webp';
import neckImg from '../../../images/landing/cards/problem-neck.webp';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';

const problems = [
    { label: 'হাঁটু ও জয়েন্ট', image: kneeImg },
    { label: 'পিঠ ও কোমর', image: backImg },
    { label: 'ঘাড় ও কাঁধ', image: neckImg },
    { label: 'পেশির টান', image: muscleImg },
    { label: 'পা ও গোড়ালি', image: feetImg },
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
                    {problems.map(({ label, image }) => (
                        <RevealItem key={label}>
                            <motion.div
                                whileHover="hover"
                                className="group relative aspect-[3/4] overflow-hidden rounded-[1.75rem] border border-amber-200/80 bg-stone-950 shadow-sm"
                            >
                                <motion.img
                                    src={image}
                                    alt={label}
                                    variants={{ hover: { scale: 1.08 } }}
                                    transition={{
                                        duration: 0.8,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute inset-0 size-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/10 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 p-3">
                                    <span className="font-bengali text-sm font-semibold text-white drop-shadow sm:text-base">
                                        {label}
                                    </span>
                                </div>
                                <div className="absolute top-3 right-3 size-2 rounded-full bg-amber-400 shadow-[0_0_12px_3px_rgba(251,191,36,0.6)]" />
                            </motion.div>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
