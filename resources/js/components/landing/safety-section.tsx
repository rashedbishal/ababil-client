import {
    AlertTriangle,
    Baby,
    Ban,
    Check,
    Eye,
    FlaskConical,
    Lock,
    type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import Reveal from './motion/reveal';

const notices: {
    icon: LucideIcon;
    title: string;
    description: string;
}[] = [
    {
        icon: Ban,
        title: 'শুধুমাত্র বাহ্যিক ব্যবহার',
        description:
            'এই অয়েল শুধুমাত্র ত্বকে ব্যবহারের জন্য তৈরি। কখনোই মুখে খাবেন না বা পান করবেন না।',
    },
    {
        icon: FlaskConical,
        title: 'প্যাচ টেস্ট করে নিন',
        description:
            'প্রথমবার ব্যবহারের আগে হাতের কনুইয়ের ভাঁজে সামান্য অয়েল লাগিয়ে ২৪ ঘণ্টা পর্যবেক্ষণ করুন।',
    },
    {
        icon: Baby,
        title: 'গর্ভাবস্থা ও স্তন্যদানে সতর্কতা',
        description:
            'গর্ভাবস্থায় বা স্তন্যদানকালে ব্যবহারের আগে অবশ্যই চিকিৎসকের পরামর্শ নিন।',
    },
    {
        icon: Eye,
        title: 'চোখ ও খোলা ক্ষত এড়িয়ে চলুন',
        description: 'চোখ, মুখগহ্বর, খোলা ক্ষত বা অতি সংবেদনশীল ত্বকে ব্যবহার করবেন না।',
    },
    {
        icon: Lock,
        title: 'শিশুদের নাগালের বাইরে রাখুন',
        description:
            'ব্যবহারের পর বোতল শক্তভাবে বন্ধ করে শিশুদের নাগালের বাইরে সংরক্ষণ করুন।',
    },
];

export default function SafetySection() {
    const [acknowledged, setAcknowledged] = useState<boolean[]>(() =>
        Array.from({ length: notices.length }, () => false),
    );

    const toggle = (idx: number) => {
        setAcknowledged((prev) =>
            prev.map((value, i) => (i === idx ? !value : value)),
        );
    };

    const readCount = acknowledged.filter(Boolean).length;
    const allRead = readCount === notices.length;
    const progress = (readCount / notices.length) * 100;

    return (
        <section className="relative overflow-hidden bg-stone-950 py-8 sm:py-14">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.12),transparent_60%)]"
            />
            <div
                aria-hidden
                className="animate-float-slow pointer-events-none absolute top-1/2 left-1/2 hidden size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl md:block"
            />

            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                <Reveal>
                    <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-b from-stone-900 to-stone-950 p-6 shadow-2xl shadow-amber-950/40 sm:p-10">
                        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-left">
                            <div className="flex items-center gap-3">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-950 shadow-lg shadow-amber-500/30 sm:size-12">
                                    <AlertTriangle className="size-5 sm:size-6" />
                                </span>
                                <div>
                                    <h2 className="font-bengali text-xl font-bold text-white sm:text-2xl">
                                        ব্যবহারের সতর্কতা
                                    </h2>
                                    <p className="mt-0.5 font-bengali text-xs text-neutral-400 sm:text-sm">
                                        প্রতিটি নির্দেশনায় ট্যাপ করে পড়া হয়েছে চিহ্নিত
                                        করুন
                                    </p>
                                </div>
                            </div>

                            <div className="flex w-full flex-col items-center gap-1.5 sm:w-auto sm:items-end">
                                <span
                                    className={`font-bengali text-xs font-semibold tabular-nums ${
                                        allRead
                                            ? 'text-emerald-400'
                                            : 'text-amber-400'
                                    }`}
                                >
                                    {readCount} / {notices.length} পড়া হয়েছে
                                </span>
                                <div className="h-1.5 w-full max-w-[10rem] overflow-hidden rounded-full bg-white/10 sm:w-40">
                                    <motion.div
                                        className={`h-full rounded-full ${
                                            allRead
                                                ? 'bg-emerald-400'
                                                : 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                        }`}
                                        animate={{ width: `${progress}%` }}
                                        transition={{
                                            duration: 0.5,
                                            ease: [0.16, 1, 0.3, 1],
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
                            {notices.map((notice, idx) => {
                                const Icon = notice.icon;
                                const isChecked = acknowledged[idx];

                                return (
                                    <li key={notice.title}>
                                        <button
                                            type="button"
                                            onClick={() => toggle(idx)}
                                            aria-pressed={isChecked}
                                            className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-300 sm:gap-4 sm:px-5 sm:py-4 ${
                                                isChecked
                                                    ? 'border-amber-400/40 bg-amber-400/[0.08]'
                                                    : 'border-white/10 bg-white/[0.03] hover:border-amber-400/25 hover:bg-white/[0.06]'
                                            }`}
                                        >
                                            <span
                                                className={`relative flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 sm:size-9 ${
                                                    isChecked
                                                        ? 'bg-amber-400 text-stone-950'
                                                        : 'bg-white/10 text-amber-400'
                                                }`}
                                            >
                                                <motion.span
                                                    initial={false}
                                                    animate={{
                                                        scale: isChecked
                                                            ? [0.6, 1.15, 1]
                                                            : 1,
                                                        rotate: isChecked
                                                            ? 0
                                                            : 0,
                                                    }}
                                                    transition={{
                                                        duration: 0.35,
                                                        ease: [0.16, 1, 0.3, 1],
                                                    }}
                                                    className="flex items-center justify-center"
                                                >
                                                    {isChecked ? (
                                                        <Check className="size-4 sm:size-5" />
                                                    ) : (
                                                        <Icon className="size-4 sm:size-5" />
                                                    )}
                                                </motion.span>
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-bengali text-sm font-semibold text-white sm:text-base">
                                                    {notice.title}
                                                </p>
                                                <p className="mt-1 font-bengali text-xs leading-relaxed text-neutral-400 sm:text-sm">
                                                    {notice.description}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        <motion.div
                            initial={false}
                            animate={{
                                height: allRead ? 'auto' : 0,
                                opacity: allRead ? 1 : 0,
                                marginTop: allRead ? 20 : 0,
                            }}
                            transition={{
                                duration: 0.4,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="overflow-hidden"
                        >
                            <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center">
                                <Check className="size-4 shrink-0 text-emerald-400" />
                                <p className="font-bengali text-sm font-semibold text-emerald-300">
                                    চমৎকার! সবগুলো নির্দেশনা পড়া হয়েছে — এখন নিশ্চিন্তে
                                    ব্যবহার করুন।
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
