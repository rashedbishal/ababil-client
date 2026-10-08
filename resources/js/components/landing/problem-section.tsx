import { CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import backImg from '../../../images/landing/cards/problem-back.webp';
import feetImg from '../../../images/landing/cards/problem-feet.webp';
import kneeImg from '../../../images/landing/cards/problem-knee.webp';
import muscleImg from '../../../images/landing/cards/problem-muscle.webp';
import neckImg from '../../../images/landing/cards/problem-neck.webp';
import Magnetic from './motion/magnetic';
import Reveal from './motion/reveal';
import TiltCard from './motion/tilt-card';
import OrderButton from './order-button';

const bnDigits = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const problems = [
    {
        label: 'হাঁটু ও জয়েন্টের ব্যথা',
        badge: 'গিরা ও জয়েন্টের ক্ষয়রোধ',
        descriptionMobile:
            'ওঠাবসা বা হাঁটার সময় হাঁটুর ব্যথা দৈনন্দিন জীবনে অস্বস্তি তৈরি করে। আবাবিল দ্রুত প্রবেশ করে জয়েন্টের ব্যথা উপশমে সাহায্য করে।',
        descriptionDesktop:
            'বয়সজনিত জয়েন্টের ক্ষয়, লিগামেন্ট টান বা জয়েন্ট ফ্লুইড হ্রাসের কারণে হাঁটু ও গিরায় তীব্র যন্ত্রণা হতে পারে। আবাবিল অর্গানিক অয়েলের ভেষজ নির্যাস জয়েন্টের গভীরে দ্রুত শোষিত হয়ে প্রদাহ কমায়, রগের টান শিথিল করে এবং স্বাভাবিক হাঁটাচলার শক্তি ফিরিয়ে আনে।',
        features: [
            '১০ মিনিটে দ্রুত রক্ত সঞ্চালন বৃদ্ধি ও উপশম',
            'জয়েন্ট ও রগের প্রদাহ প্রাকৃতিক উপায়ে হ্রাস',
            '১০০% অর্গানিক ও পার্শ্বপ্রতিক্রিয়ামুক্ত ভেষজ',
        ],
        image: kneeImg,
    },
    {
        label: 'পিঠ ও কোমরের তীব্র ব্যথা',
        badge: 'মেরুদণ্ড ও কোমরের রিফ্রেশমেন্ট',
        descriptionMobile:
            'দীর্ঘক্ষণ বসে কাজ বা ভারী কাজের ফলে পিঠ ও কোমরে ব্যথা হতে পারে। নিয়মিত ম্যাসাজে স্বস্তি পাবেন।',
        descriptionDesktop:
            'দীর্ঘসময় কম্পিউটার বা ডেস্কে একটানা বসে থাকা, ভুল পজিশনে শোয়া অথবা ভারী কাজ করার ফলে মেরুদণ্ড ও কোমরের পেশিতে মারাত্মক খিঁচুনি সৃষ্টি হয়। হালকা গরম আবাবিল তেল ম্যাসাজ করলে পেশির রক্ত সঞ্চালন বৃদ্ধি পায়, ক্লান্তি দূর হয় এবং কোমরের নমনীয়তা দ্রুত ফিরে আসে।',
        features: [
            'ডেস্কে দীর্ঘক্ষণ বসার রগ টানা ও ক্লান্তি দূর',
            'মেরুদণ্ডের পেশি ও রগের টান শিথিল করা',
            'মৃদু প্রাকৃতিক উষ্ণতায় গভীর আরামদান',
        ],
        image: backImg,
    },
    {
        label: 'পা ও গোড়ালির ক্লান্তি ও ব্যথা',
        badge: 'সারাদিনের ক্লান্তি নিরসন',
        descriptionMobile:
            'দীর্ঘ সময় দাঁড়িয়ে থাকা বা হাঁটার ফলে পা ও গোড়ালিতে ব্যথা হতে পারে। আবাবিল আরাম দিতে সাহায্য করে।',
        descriptionDesktop:
            'সারাদিন দাঁড়িয়ে কাজ করা, দীর্ঘ পথ হাঁটা বা অনিয়মিত জুতোর ব্যবহারে পা ও গোড়ালিতে যন্ত্রণাদায়ক টান তৈরি হয়। রাতে শোয়ার আগে আবাবিল তেল ম্যাসাজ করলে পায়ের সারাদিনের ক্লান্তি দূর হয় এবং সকালে সম্পূর্ণ হালকা অনুভূতি নিয়ে নতুন দিন শুরু করা যায়।',
        features: [
            'সারাদিন দাঁড়িয়ে কাজ করার পায়ের ক্লান্তি নিরাময়',
            'গোড়ালি ও পায়ের তলির টানা ও স্প্যাজম উপশম',
            'রাতের সুনিদ্রা ও সজীব অনুভূতি প্রদান',
        ],
        image: feetImg,
    },
    {
        label: 'ঘাড় ও কাঁধের খিঁচুনি — মায়ের যত্ন',
        badge: 'মায়ের প্রতি ভালোবাসা ও সেবা',
        descriptionMobile:
            'পরিবারের যত্ন নিতে নিতে মায়েদের ঘাড় ও কাঁধে ব্যথা জমে যায়। আবাবিল দিয়ে মৃদু ম্যাসাজে মাকে দিন প্রাপ্য আরাম।',
        descriptionDesktop:
            'পরিবারের সার্বক্ষণিক যত্ন নিতে গিয়ে মায়েরা প্রায়ই ঘাড় ও কাঁধের তীব্র ব্যথায় কষ্ট পান। নিয়মিত কাজের চাপ ও মানসিক ক্লান্তিতে ঘাড়ের রগ টান ধরে থাকে। পরিবারের প্রিয় মানুষটির ঘাড়ে ও কাঁধে আবাবিল অয়েলের মৃদু ম্যাসাজ পেশির খিঁচুনি দূর করে এনে দেয় গভীর প্রশান্তি।',
        features: [
            'শক্ত ঘাড় ও কাঁধের রগ দ্রুত শিথিল করা',
            'প্রিয় মায়েদের পরম শারীরিক স্বস্তি ও প্রশান্তি',
            'সম্পূর্ণ নিরাপদ ও কোমল ভেষজ অয়েল ফর্মুলা',
        ],
        image: neckImg,
    },
    {
        label: 'পেশির তীব্র টান ও ক্লান্তি — প্রিয়জনের সেবা',
        badge: 'পরিবারের সুরক্ষা ও বিশেষ যত্ন',
        descriptionMobile:
            'হঠাৎ টান বা ব্যায়ামজনিত পেশির ব্যথায় দ্রুত উপশম প্রয়োজন। আবাবিল উষ্ণতা ছড়িয়ে পেশি শিথিল করে।',
        descriptionDesktop:
            'সন্তান বা পরিবারের কারও হঠাৎ পেশির টান, মচকানো কিংবা শারীরিক ক্লান্তিতে বাবামা বা স্বজনদের উদ্বেগ বাড়ে। আবাবিল অয়েলের হালকা স্পর্শে ত্বকের গভীরে প্রাকৃতিক উষ্ণতা ছড়ায় যা রক্ত সঞ্চালন বাড়িয়ে রগের টান ও ব্যথা দ্রুত উপশম করে পরম স্বস্তি এনে দেয়।',
        features: [
            'হঠাৎ পেশির টান ও মচকানোয় তাত্ক্ষণিক নিরাময়',
            'গভীর ত্বক ভেদে দ্রুত শোষিত ও কার্যকারী',
            'পরিবারের ছোট-বড় সবার জন্য সর্বাত্মক সুরক্ষা',
        ],
        image: muscleImg,
    },
];

export default function ProblemSection() {
    return (
        <section
            id="problem"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-amber-50 via-white to-amber-50 py-8 sm:py-16"
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

                <div className="relative mt-8 space-y-10 sm:mt-16 sm:space-y-16">
                    <div
                        aria-hidden
                        className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-300 to-transparent lg:block"
                    />

                    {problems.map(
                        (
                            {
                                label,
                                badge,
                                descriptionMobile,
                                descriptionDesktop,
                                features,
                                image,
                            },
                            i,
                        ) => {
                            const fromLeft = i % 2 === 0;

                            return (
                                <motion.div
                                    key={label}
                                    initial={{
                                        opacity: 0,
                                        x: fromLeft ? -90 : 90,
                                    }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{
                                        once: true,
                                        margin: '0px 0px -120px 0px',
                                    }}
                                    transition={{
                                        duration: 2.6,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className={`group relative flex flex-col items-center gap-4 sm:gap-10 lg:flex-row ${
                                        fromLeft ? '' : 'lg:flex-row-reverse'
                                    }`}
                                >
                                    {/* Clickable Image Container (All Devices) */}
                                    <a
                                        href="#checkout"
                                        aria-label={`অর্ডার করুন - ${label}`}
                                        className="relative block w-full max-w-lg shrink-0 cursor-pointer lg:w-[31rem]"
                                    >
                                        <div
                                            aria-hidden
                                            className="absolute -inset-4 hidden rounded-[2.5rem] bg-gradient-to-br from-amber-300/50 to-transparent opacity-80 blur-2xl transition-opacity duration-1000 group-hover:opacity-100 md:block"
                                        />
                                        <TiltCard
                                            strength={7}
                                            className="relative overflow-hidden rounded-[2.25rem] border border-amber-200/80 bg-stone-950 shadow-2xl shadow-amber-900/20 transition-all duration-500 group-hover:border-amber-400/80 group-hover:shadow-amber-500/30"
                                        >
                                            <motion.img
                                                src={image}
                                                alt={label}
                                                loading="lazy"
                                                decoding="async"
                                                whileHover={{ scale: 1.08 }}
                                                transition={{
                                                    duration: 1.7,
                                                    ease: [0.16, 1, 0.3, 1],
                                                }}
                                                className="block h-auto w-full object-contain"
                                            />
                                        </TiltCard>
                                        <span className="absolute -top-2 -left-2 flex size-9 items-center justify-center rounded-full border-2 border-amber-50 bg-stone-950 font-bengali text-sm font-bold text-amber-300 shadow-lg sm:-top-3 sm:-left-3 sm:size-12 sm:text-lg lg:-top-4 lg:-left-4 lg:size-14 lg:border-4 lg:text-xl">
                                            {bnDigits[i]}
                                        </span>
                                    </a>

                                    {/* Text Section */}
                                    <div
                                        className={`flex-1 text-center lg:text-left ${
                                            fromLeft ? '' : 'lg:text-right'
                                        }`}
                                    >
                                        {/* Mobile & Tab Description */}
                                        <div className="lg:hidden">
                                            <h3 className="font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                                                {label}
                                            </h3>
                                            <p className="mx-auto mt-2 max-w-md font-bengali text-base text-stone-600 sm:mt-3 sm:text-lg">
                                                {descriptionMobile}
                                            </p>

                                            <div className="mt-3 flex justify-center sm:mt-5">
                                                <Magnetic strength={0.25}>
                                                    <OrderButton
                                                        size="sm"
                                                        href="#checkout"
                                                    >
                                                        অর্ডার করুন
                                                    </OrderButton>
                                                </Magnetic>
                                            </div>
                                        </div>

                                        {/* Desktop & Laptop Enriched Section */}
                                        <div className="hidden lg:block">
                                            <span className="inline-block rounded-full border border-amber-300/70 bg-amber-100/80 px-3 py-1 font-bengali text-xs font-bold text-amber-900 shadow-2xs">
                                                {badge}
                                            </span>
                                            <h3 className="mt-2 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                                                {label}
                                            </h3>
                                            <p className="mt-3 font-bengali text-base leading-relaxed text-stone-700">
                                                {descriptionDesktop}
                                            </p>

                                            {/* Feature Highlights Checklist */}
                                            <ul
                                                className={`mt-4 space-y-2 font-bengali text-sm font-semibold text-stone-800 ${
                                                    fromLeft
                                                        ? 'text-left'
                                                        : 'text-right'
                                                }`}
                                            >
                                                {features.map((feat) => (
                                                    <li
                                                        key={feat}
                                                        className={`flex items-center gap-2 ${
                                                            fromLeft
                                                                ? 'justify-start'
                                                                : 'justify-end'
                                                        }`}
                                                    >
                                                        {fromLeft ? (
                                                            <>
                                                                <CheckCircle2 className="size-4 shrink-0 text-amber-600" />
                                                                <span>
                                                                    {feat}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>
                                                                    {feat}
                                                                </span>
                                                                <CheckCircle2 className="size-4 shrink-0 text-amber-600" />
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Action Buttons */}
                                            <div
                                                className={`mt-6 flex items-center gap-3 ${
                                                    fromLeft
                                                        ? 'justify-start'
                                                        : 'justify-end'
                                                }`}
                                            >
                                                <Magnetic strength={0.25}>
                                                    <OrderButton
                                                        size="sm"
                                                        href="#checkout"
                                                    >
                                                        অর্ডার করুন
                                                    </OrderButton>
                                                </Magnetic>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        },
                    )}
                </div>
            </div>
        </section>
    );
}
