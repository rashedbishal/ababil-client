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
        <section className="bg-white py-8 sm:py-20">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        সাধারণ জিজ্ঞাসা
                    </h2>
                </Reveal>

                <RevealGroup className="mt-8 space-y-3">
                    {faqs.map(({ question, answer }) => (
                        <RevealItem key={question}>
                            <Collapsible className="group rounded-xl border border-amber-200 bg-amber-50/50 px-5 py-1 transition-colors hover:border-amber-300">
                                <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 py-4 text-left">
                                    <span className="font-bengali text-sm font-medium text-stone-900 sm:text-base">
                                        {question}
                                    </span>
                                    <ChevronDown className="size-4 shrink-0 text-amber-600 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="pb-4 font-bengali text-sm text-stone-600">
                                    {answer}
                                </CollapsibleContent>
                            </Collapsible>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
