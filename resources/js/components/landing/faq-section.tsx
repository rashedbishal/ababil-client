import { ChevronDown } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';

const faqs = [
    {
        question: 'কতদিন ব্যবহারে ফলাফল পাওয়া যাবে?',
        answer: 'নিয়মিত দিনে ২-৩ বার ব্যবহারে বেশিরভাগ ক্ষেত্রে কয়েক দিনের মধ্যেই আরাম অনুভব করা যায়। ব্যথার ধরন ও তীব্রতার উপর ফলাফল নির্ভর করে।',
    },
    {
        question: 'ডেলিভারি পেতে কত সময় লাগে?',
        answer: 'ঢাকার ভেতরে সাধারণত ১-২ কার্যদিবস এবং ঢাকার বাইরে ২-৪ কার্যদিবসের মধ্যে ডেলিভারি সম্পন্ন হয়।',
    },
    {
        question: 'পেমেন্ট পদ্ধতি কী কী?',
        answer: 'বর্তমানে শুধুমাত্র Cash on Delivery (COD) সুবিধা চালু আছে — পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।',
    },
    {
        question: 'গর্ভবতী বা স্তন্যদানকারী মায়েরা কি ব্যবহার করতে পারবেন?',
        answer: 'ব্যবহারের আগে অবশ্যই চিকিৎসকের পরামর্শ নেওয়ার পরামর্শ দেওয়া হচ্ছে। বিস্তারিত সতর্কতা উপরের "ব্যবহারের সতর্কতা" অংশে দেওয়া আছে।',
    },
    {
        question: 'পণ্য পছন্দ না হলে ফেরত দেওয়া যাবে কি?',
        answer: 'হ্যাঁ, ডেলিভারির ৩ দিনের মধ্যে যোগাযোগ করলে আমাদের Money-Back গ্যারান্টি নীতি অনুযায়ী ব্যবস্থা নেওয়া হবে।',
    },
];

export default function FaqSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-amber-50/50 to-white py-8 sm:py-14">
            <div
                aria-hidden
                className="pointer-events-none absolute top-0 left-1/2 hidden size-96 -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-400/10 blur-3xl md:block"
            />

            <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
                <Reveal className="text-center">
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800">
                        আপনার প্রশ্নের উত্তর
                    </span>
                    <h2 className="mt-4 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        সাধারণ জিজ্ঞাসা
                    </h2>
                </Reveal>

                <RevealGroup className="mt-8 space-y-3 sm:mt-10">
                    {faqs.map(({ question, answer }, index) => (
                        <RevealItem key={question}>
                            <Collapsible className="group rounded-2xl border border-amber-200/80 bg-white px-5 py-1 shadow-sm shadow-amber-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/10">
                                <CollapsibleTrigger className="flex w-full items-center gap-4 py-4 text-left">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-50 font-bengali text-xs font-bold text-amber-700 transition-colors duration-300 group-data-[state=open]:bg-gradient-to-br group-data-[state=open]:from-amber-400 group-data-[state=open]:to-amber-600 group-data-[state=open]:text-white">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span className="flex-1 font-bengali text-sm font-medium text-stone-900 sm:text-base">
                                        {question}
                                    </span>
                                    <ChevronDown className="size-4 shrink-0 text-amber-600 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <p className="mt-1 border-t border-amber-100 pt-3 pb-4 pl-11 font-bengali text-sm text-stone-600">
                                        {answer}
                                    </p>
                                </CollapsibleContent>
                            </Collapsible>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
