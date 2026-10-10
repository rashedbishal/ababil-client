import { ChevronDown } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

const faqs = [
    {
        question: 'কী কী উপাদান আছে?',
        answer: 'ব্র্যান্ডের দেওয়া তথ্য অনুযায়ী, এতে বোসওয়েলিয়া, আর্নিকা, টি ট্রি, ইউক্যালিপটাস ও ভিটামিন-ই সহ ৯টি উপাদান রয়েছে। পূর্ণ তালিকার জন্য বোতলের লেবেল দেখে নিন।',
    },
    {
        question: 'প্রথমবার ব্যবহার করব, কীভাবে শুরু করব?',
        answer: 'বোতলের লেবেলে দেওয়া পরিমাণ ও ব্যবহারবিধি মেনে ম্যাসাজ করুন। নির্দেশনা বুঝতে সাহায্য লাগলে WhatsApp-এ আমাদের লিখুন।',
    },
    {
        question: 'ব্যবহারের আগে গরম করতে হবে?',
        answer: 'ব্র্যান্ডের নির্দেশনা অনুযায়ী আলাদা করে গরম করার প্রয়োজন নেই। ব্যবহারের সময় বোতলের লেবেলের নির্দেশনা অনুসরণ করুন।',
    },
    {
        question: 'এক বোতলে কতটুকু থাকে?',
        answer: 'প্রতি বোতলে ২০০ মি.লি. অয়েল। অর্ডারের সময় আপনার প্রয়োজনমতো বোতলের সংখ্যা বেছে নিতে পারবেন।',
    },
    {
        question: 'কতদিনে আরাম পাব?',
        answer: 'ব্যথার কারণ ও ব্যক্তিভেদে অভিজ্ঞতা আলাদা হতে পারে। নির্দিষ্ট সময়ে একই ফলের নিশ্চয়তা দেওয়া যায় না। ব্যথা দীর্ঘদিন থাকলে চিকিৎসকের পরামর্শ নিন।',
    },
    {
        question: 'অর্ডার করব কীভাবে?',
        answer: '"অর্ডার করুন" বাটনে ক্লিক করে নাম, মোবাইল নম্বর ও ঠিকানা দিন। বোতলের সংখ্যা ও ডেলিভারি এলাকা বেছে নিলে মোট মূল্য দেখতে পাবেন।',
    },
    {
        question: 'পণ্য হাতে পেয়ে টাকা দিতে পারব?',
        answer: 'হ্যাঁ। ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।',
    },
    {
        question: 'আমার এলাকায় ডেলিভারি চার্জ কত?',
        answer: 'ঢাকা সিটি কর্পোরেশনের ভিতরে ও বাইরে আলাদা ডেলিভারি চার্জ প্রযোজ্য। অর্ডার ফরমে এলাকা বেছে নিলেই ডেলিভারি সহ মোট মূল্য দেখাবে।',
    },
    {
        question: 'কেনার আগে একটু কথা বলতে চাই।',
        answer: 'অবশ্যই। নিচের WhatsApp বাটনে ক্লিক করে মেসেজ দিন।',
    },
];

/** Concept 3's FAQ accordion. */
export default function Concept3FaqSection() {
    return (
        <section id="faq" className="scroll-mt-24 bg-white">
            <div className="mx-auto max-w-[830px] px-4 py-10 sm:px-6 sm:py-14">
                <div className="text-center">
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800">
                        আপনার প্রশ্নের উত্তর
                    </span>
                    <h2 className="mt-4 font-bengali text-[29px] font-bold text-stone-900 sm:text-4xl">
                        কেনার আগে জেনে নিন
                    </h2>
                    <p className="mt-2 font-bengali text-base text-stone-600">
                        যে প্রশ্নগুলো আপনার মনেও আসতে পারে।
                    </p>
                </div>

                <div className="mt-8 space-y-3 sm:mt-10">
                    {faqs.map(({ question, answer }, index) => (
                        <Collapsible
                            key={question}
                            className="group rounded-2xl border border-amber-200/80 bg-white px-5 py-1 shadow-sm shadow-amber-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/10"
                        >
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
                    ))}
                </div>
            </div>
        </section>
    );
}
