import { BadgeCheck, Leaf } from 'lucide-react';
// Stock photo (cropped): "A group of scientists working in a laboratory" by Esculab,
// CC0 — https://commons.wikimedia.org/wiki/File:A_group_of_scientists_working_in_a_laboratory_Esculab.jpg
// Swap for real product/lab photography when available.
import labTestedImage from '../../../images/landing/lab-tested.webp';
import Reveal from './motion/reveal';

const points = [
    'প্রতিটি ব্যাচ আলাদাভাবে পরীক্ষা করা হয়, যাতে কোনো ত্রুটিপূর্ণ ব্যাচ আপনার হাতে না পৌঁছায়',
    '১০০% প্রাকৃতিক ও অর্গানিক উপাদানের বিশুদ্ধতা ও মান যাচাই করা হয়, কোনো ক্ষতিকর কেমিক্যাল মেশানো হয় না',
    'ত্বকের জন্য নিরাপদ কিনা তা নিশ্চিত করার পরই বাজারজাত করা হয়',
    'কাঁচামাল সংগ্রহ থেকে বোতলজাত করা পর্যন্ত প্রতিটি ধাপে মান নিয়ন্ত্রণ বজায় রাখা হয়',
];

export default function LabTestedSection() {
    return (
        <section
            id="lab-tested"
            className="scroll-mt-24 overflow-hidden bg-stone-50 py-8 sm:py-20"
        >
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
                <Reveal>
                    <div className="group relative mb-5">
                        <div
                            aria-hidden
                            className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-r from-amber-400/50 via-yellow-300/40 to-amber-500/50 opacity-80 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                        />
                        <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 px-5 py-4 shadow-2xl shadow-amber-900/30 sm:px-7 sm:py-5">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.25),transparent_55%)]"
                            />
                            <span className="relative flex size-14 shrink-0 flex-col items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 text-stone-950 shadow-lg ring-2 shadow-amber-400/50 ring-amber-200/60 sm:size-[4.5rem]">
                                <span className="font-bengali text-xl leading-none font-extrabold tracking-tight sm:text-2xl">
                                    ১০০
                                </span>
                                <span className="mt-0.5 font-bengali text-[9px] leading-none font-bold tracking-wide uppercase sm:text-[10px]">
                                    বছর
                                </span>
                            </span>
                            <p className="relative font-bengali text-lg leading-snug font-bold text-amber-50 sm:text-2xl">
                                শত বছরের গবেষণা থেকে প্রাপ্ত প্রাকৃতিক তেল
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/60 bg-emerald-50 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-emerald-700">
                        <Leaf className="size-3.5" />
                        ১০০% অর্গানিক উপাদান
                    </span>
                    <h2 className="mt-3 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        ল্যাবে পরীক্ষিত বিশুদ্ধ উপাদান
                    </h2>
                    <p className="mt-4 font-bengali text-sm leading-relaxed text-stone-600 sm:text-base">
                        আবাবিল তৈরি হয় সম্পূর্ণ প্রাকৃতিক ও অর্গানিক ভেষজ উপাদান দিয়ে, কোনো
                        ক্ষতিকর কেমিক্যাল বা কৃত্রিম প্রিজারভেটিভ ছাড়াই। কাঁচামাল সংগ্রহের পর
                        থেকে বোতলজাত হওয়া পর্যন্ত প্রতিটি ধাপ নিয়ন্ত্রিত ল্যাবে পরীক্ষা করা
                        হয়, যাতে প্রতিটি বোতলে থাকে নির্ভরযোগ্য মান, বিশুদ্ধতা ও নিরাপত্তা।
                        আমরা বিশ্বাস করি, আপনার ও আপনার পরিবারের ত্বকে শুধু সেই উপাদানই
                        ব্যবহার করা উচিত যা প্রকৃতি থেকে আসে এবং বিজ্ঞান দিয়ে যাচাইকৃত।
                    </p>
                    <ul className="mt-6 space-y-3">
                        {points.map((point) => (
                            <li
                                key={point}
                                className="flex items-start gap-3 font-bengali text-sm text-stone-800 sm:text-base"
                            >
                                <BadgeCheck className="mt-0.5 size-5 shrink-0 text-amber-500" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </Reveal>

                <Reveal delay={0.1}>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 shadow-xl shadow-stone-900/10">
                        <img
                            src={labTestedImage}
                            alt="নিয়ন্ত্রিত ল্যাবে আবাবিলের উপাদান পরীক্ষা করা হচ্ছে"
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover"
                        />
                        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 font-bengali text-xs font-semibold text-emerald-700 shadow-md backdrop-blur-sm">
                            <Leaf className="size-3.5" />
                            অর্গানিক ভেষজ উপাদান
                        </span>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
