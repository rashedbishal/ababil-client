import { motion } from 'motion/react';
import warmingImg from '../../../images/landing/cards/usp-warming.webp';
import nonstickyImg from '../../../images/landing/cards/usp-nonsticky.webp';
import massageImg from '../../../images/landing/cards/usp-massage.webp';
import skincareImg from '../../../images/landing/cards/usp-skincare.webp';
import arnicaImg from '../../../images/landing/cards/ing-arnica.webp';
import vitamineImg from '../../../images/landing/cards/ing-vitamine.webp';
import Reveal from './motion/reveal';

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

export default function UspSection() {
    return (
        <section
            id="usp"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100/60 py-16 sm:py-24"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.15),transparent_50%)]"
            />
            <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
                        কেন আবাবিল বেছে নেবেন
                    </h2>
                </Reveal>

                <div className="relative mt-16 space-y-16 sm:mt-24 sm:space-y-24">
                    <div
                        aria-hidden
                        className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-400/60 to-transparent sm:block"
                    />

                    {usps.map(({ title, description, image }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 70, scale: 0.8 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{
                                once: true,
                                margin: '0px 0px -100px 0px',
                            }}
                            transition={{
                                duration: 1,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className={`relative flex flex-col items-center text-center ${
                                i % 2 === 0
                                    ? 'sm:-translate-x-10'
                                    : 'sm:translate-x-10'
                            }`}
                        >
                            <div className="relative">
                                <div
                                    aria-hidden
                                    className="absolute -inset-5 rounded-full bg-gradient-to-br from-amber-400/40 via-yellow-300/20 to-transparent blur-2xl"
                                />
                                <div className="relative flex size-36 items-center justify-center rounded-full border-4 border-amber-200 bg-white p-1.5 shadow-2xl shadow-amber-900/20 sm:size-44">
                                    <img
                                        src={image}
                                        alt=""
                                        className="size-full rounded-full object-cover"
                                    />
                                </div>
                                <span className="absolute right-0 bottom-0 flex size-10 items-center justify-center rounded-full border-4 border-amber-50 bg-stone-950 font-bengali text-sm font-bold text-amber-300 shadow-lg sm:size-12 sm:text-base">
                                    {bnDigits[i]}
                                </span>
                            </div>

                            <h3 className="mt-7 font-bengali text-xl font-bold text-stone-900 sm:text-2xl">
                                {title}
                            </h3>
                            <p className="mt-2 max-w-xs font-bengali text-sm text-stone-600 sm:text-base">
                                {description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
