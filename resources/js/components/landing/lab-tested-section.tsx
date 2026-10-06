import { BadgeCheck, FlaskConical } from 'lucide-react';
import Reveal from './motion/reveal';

const points = [
    'প্রতিটি ব্যাচ আলাদাভাবে পরীক্ষা করা হয়',
    'উপাদানের বিশুদ্ধতা ও মান যাচাই করা হয়',
    'নিরাপদ ব্যবহারের জন্য নিশ্চিত করা হয়',
];

export default function LabTestedSection() {
    return (
        <section
            id="lab-tested"
            className="scroll-mt-24 overflow-hidden bg-stone-50 py-14 sm:py-20"
        >
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-14">
                <Reveal>
                    <h2 className="font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        ল্যাবে পরীক্ষিত বিশুদ্ধ উপাদান
                    </h2>
                    <p className="mt-4 font-bengali text-sm leading-relaxed text-stone-600 sm:text-base">
                        আবাবিল তৈরির প্রতিটি ধাপ নিয়ন্ত্রিত ল্যাবে পরীক্ষা করা হয়, যাতে
                        প্রতিটি বোতলে থাকে নির্ভরযোগ্য মান ও নিরাপত্তা।
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
                    {/* Placeholder: replace this block with a real lab photo (an <img> with rounded-2xl object-cover) when available. */}
                    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-stone-200 bg-gradient-to-br from-sky-100 via-white to-amber-50 shadow-xl shadow-stone-900/10">
                        <FlaskConical className="size-20 text-sky-400/70 sm:size-24" />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
