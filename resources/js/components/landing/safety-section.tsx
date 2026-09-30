import { AlertTriangle } from 'lucide-react';
import Reveal from './motion/reveal';

const notices = [
    'শুধুমাত্র বাহ্যিক ব্যবহারের জন্য। খাওয়ার জন্য নয়।',
    'প্রথমবার ব্যবহারের আগে ত্বকের ছোট একটি অংশে প্যাচ টেস্ট করে নিন।',
    'গর্ভাবস্থায় বা স্তন্যদানকালে ব্যবহারের আগে চিকিৎসকের পরামর্শ নিন।',
    'চোখ, খোলা ক্ষত বা সংবেদনশীল ত্বকে ব্যবহার করবেন না।',
    'শিশুদের নাগালের বাইরে সংরক্ষণ করুন।',
];

export default function SafetySection() {
    return (
        <section className="bg-amber-50 py-14 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <Reveal>
                    <div className="rounded-2xl border border-amber-300 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="size-6 shrink-0 text-amber-600" />
                            <h2 className="font-bengali text-xl font-bold text-stone-900 sm:text-2xl">
                                ব্যবহারের সতর্কতা
                            </h2>
                        </div>

                        <ul className="mt-5 space-y-2.5 font-bengali text-sm text-stone-700">
                            {notices.map((notice) => (
                                <li key={notice} className="flex gap-2.5">
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                                    {notice}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
