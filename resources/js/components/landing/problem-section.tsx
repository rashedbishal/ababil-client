import { motion } from 'motion/react';
import backImg from '../../../images/landing/cards/problem-back.webp';
import feetImg from '../../../images/landing/cards/problem-feet.webp';
import kneeImg from '../../../images/landing/cards/problem-knee.webp';
import muscleImg from '../../../images/landing/cards/problem-muscle.webp';
import neckImg from '../../../images/landing/cards/problem-neck.webp';
import Reveal from './motion/reveal';

const bnDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const problems = [
    {
        label: 'হাঁটু ও জয়েন্ট',
        description:
            'ওঠাবসা বা হাঁটার সময় হাঁটুর ব্যথা দৈনন্দিন জীবনে অস্বস্তি তৈরি করে। আবাবিল দ্রুত প্রবেশ করে জয়েন্টের ব্যথা উপশমে সাহায্য করে।',
        image: kneeImg,
    },
    {
        label: 'পিঠ ও কোমর',
        description:
            'দীর্ঘক্ষণ বসে কাজ বা ভারী কাজের ফলে পিঠ ও কোমরে ব্যথা হতে পারে। নিয়মিত ম্যাসাজে স্বস্তি পাবেন।',
        image: backImg,
    },
    {
        label: 'ঘাড় ও কাঁধ',
        description:
            'দীর্ঘসময় স্ক্রিনে কাজ করার ফলে ঘাড় ও কাঁধে টান পড়ে। আবাবিল পেশি শিথিল করে আরাম দেয়।',
        image: neckImg,
    },
    {
        label: 'পেশির টান',
        description:
            'হঠাৎ টান বা ব্যায়ামজনিত পেশির ব্যথায় দ্রুত উপশম প্রয়োজন। আবাবিল উষ্ণতা ছড়িয়ে পেশি শিথিল করে।',
        image: muscleImg,
    },
    {
        label: 'পা ও গোড়ালি',
        description:
            'দীর্ঘ সময় দাঁড়িয়ে থাকা বা হাঁটার ফলে পা ও গোড়ালিতে ব্যথা হতে পারে। আবাবিল আরাম দিতে সাহায্য করে।',
        image: feetImg,
    },
];

export default function ProblemSection() {
    return (
        <section
            id="problem"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-amber-50 via-white to-amber-50 py-16 sm:py-24"
        >
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800">
                        যেখানে ব্যথা হয়
                    </span>
                    <h2 className="mt-4 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
                        শরীরের যেসব স্থানে ব্যথা কমাতে সাহায্য করে
                    </h2>
                </Reveal>

                <div className="relative mt-16 space-y-20 sm:mt-24 sm:space-y-28">
                    <div
                        aria-hidden
                        className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-300 to-transparent lg:block"
                    />

                    {problems.map(({ label, description, image }, i) => {
                        const fromLeft = i % 2 === 0;

                        return (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, x: fromLeft ? -90 : 90 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{
                                    once: true,
                                    margin: '0px 0px -120px 0px',
                                }}
                                transition={{
                                    duration: 1.1,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                className={`relative flex flex-col items-center gap-8 sm:gap-10 lg:flex-row ${
                                    fromLeft ? '' : 'lg:flex-row-reverse'
                                }`}
                            >
                                <div className="relative w-full max-w-sm shrink-0 lg:w-[22rem]">
                                    <div
                                        aria-hidden
                                        className="absolute -inset-3 rounded-[2.25rem] bg-gradient-to-br from-amber-300/40 to-transparent blur-xl"
                                    />
                                    <motion.div
                                        whileHover="hover"
                                        className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-amber-200/80 bg-stone-950 shadow-2xl shadow-amber-900/20"
                                    >
                                        <motion.img
                                            src={image}
                                            alt={label}
                                            variants={{
                                                hover: { scale: 1.08 },
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                ease: [0.16, 1, 0.3, 1],
                                            }}
                                            className="absolute inset-0 size-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
                                    </motion.div>
                                    <span className="absolute -top-5 -left-5 flex size-16 items-center justify-center rounded-full border-4 border-amber-50 bg-stone-950 font-bengali text-xl font-bold text-amber-300 shadow-lg">
                                        {bnDigits[i]}
                                    </span>
                                </div>

                                <div
                                    className={`flex-1 text-center lg:text-left ${
                                        fromLeft ? '' : 'lg:text-right'
                                    }`}
                                >
                                    <h3 className="font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                                        {label}
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-md font-bengali text-base text-stone-600 sm:text-lg lg:mx-0">
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
