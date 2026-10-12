import { ChevronDown } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';

type Faq = {
    question: string;
    /** One entry per paragraph. */
    answer: string[];
    /** Optional bullet list rendered after the paragraphs. */
    list?: string[];
};

const faqs: Faq[] = [
    {
        question: 'আবাবিল পেইন রিলিফ অয়েল কোন কোন ব্যথায় সবচেয়ে বেশি কার্যকর?',
        answer: [
            'কোমর ব্যথা, হাঁটুর ব্যথা, অস্টিওআর্থ্রাইটিস, সায়াটিকা, ঘাড় ও পিঠের টান, পেশির ক্লান্তি এবং দীর্ঘদিনের ক্রনিক বাতের ব্যথায় এটি অত্যন্ত কার্যকর। তাছাড়া ব্যথা না থাকলেও ভালো ঘুমের জন্য পায়ের পাতায় মালিশ করলে সারা শরীরের নার্ভ রিল্যাক্স হয়ে গভীর ও প্রশান্তির ঘুম হয়।',
        ],
    },
    {
        question:
            'আবাবিল তেল কী কী উপাদান দিয়ে তৈরি? এর কোনো পার্শ্বপ্রতিক্রিয়া বা অ্যালার্জি আছে?',
        answer: [
            'শতাব্দীর পর শতাব্দী সারা বিশ্বে যেসকল প্রাকৃতিক উপাদান আয়ুর্বেদিক শাস্ত্রে শরীরের ব্যথা দূর করতে বহুল ব্যবহৃত ও পরীক্ষিত, সেসব সেরা বাছাই করা ১০০% প্রাকৃতিক ভেষজ উপাদান দিয়ে আবাবিল পেইন রিলিফ অয়েল তৈরি। এতে কোনো ক্ষতিকর কেমিক্যাল, অ্যালকোহল বা স্টেরয়েড নেই; অ্যালার্জির ঝুঁকি নেই এবং এটি সব ধরনের ত্বকের জন্য সম্পূর্ণ নিরাপদ। তবে চোখ ও শরীরের অতিসংবেদনশীল জায়গা এড়িয়ে ব্যবহার করা ভালো।',
            'আবাবিল অয়েলের উল্লেখযোগ্য প্রাকৃতিক উপাদানের মাঝে আছে—',
        ],
        list: [
            'বোসওয়েলিয়া অয়েল (Boswellia Oil)',
            'আর্নিকা অয়েল (Arnica Oil)',
            'চুয়ানক্সিয়াং অয়েল (Chuanxiong Oil)',
            'অ্যাঞ্জেলিকা অয়েল (Angelica Oil)',
            'লরোকাপ্রাম (Laurocapram)',
            'টি ট্রি অয়েল (Tea Tree Oil)',
            'ভিটামিন ই অয়েল (Vitamin E Oil)',
            'ইউক্যালিপটাস অয়েল (Eucalyptus Oil) ইত্যাদি।',
        ],
    },
    {
        question: 'এটি কি কোনো ল্যাব টেস্ট বা আন্তর্জাতিক মান দ্বারা স্বীকৃত?',
        answer: [
            'আবাবিল পেইন রিলিফ অয়েল এম. আই এন্টারপ্রাইজের একটি পণ্য। এম. আই এন্টারপ্রাইজের প্রতিটি আবাবিল পেইন রিলিফ অয়েল হাইজিনিক পরিবেশ ও উন্নত সব মেশিনারিজের মাধ্যমে তৈরি। প্রতিটি পণ্য প্রতিষ্ঠানের নিজস্ব কেমিক্যাল ল্যাব ও মাইক্রোবায়োলজিক্যাল ল্যাবে পরীক্ষিত হয়ে কঠোর মান নিয়ন্ত্রণের মাধ্যমে বাজারজাত করা হয়। এছাড়াও এটি দেশের বিজ্ঞান ও শিল্প গবেষণা পরিষদ (BCSIR) কর্তৃক টেস্টেড এবং এর প্রস্তুতকারক প্রতিষ্ঠান আন্তর্জাতিক ISO, GMP, ইংল্যান্ডের বিখ্যাত প্রতিষ্ঠান UKAS ও আমেরিকার শীর্ষস্থানীয় প্রতিষ্ঠান USAC মানদণ্ডে স্বীকৃত ও প্রত্যয়িত।',
        ],
    },
    {
        question:
            'অনেক দিনের পুরোনো ব্যথায় কি এটি কাজ করবে এবং কতদিনে আরাম পাওয়া যাবে?',
        answer: [
            'ব্যবহারের মাত্র ২–৩ মিনিটের মধ্যেই আপনি আরামদায়ক উষ্ণ অনুভূতি পাবেন যা তাৎক্ষণিক স্বস্তি দেয়। আর দীর্ঘদিনের পুরোনো ও ক্রনিক ব্যথায় স্থায়ী আরামের জন্য নিয়মিত একটানা ৩ থেকে ৪ সপ্তাহ ব্যবহারের পরামর্শ দেওয়া হয়। তবে শরীরের আরাম ও সুস্থতার জন্য এটি আরও দীর্ঘকালীন সময় ব্যবহার করলেও কোনো ক্ষতি নেই।',
        ],
    },
    {
        question:
            'এটি কীভাবে এবং দিনে কতবার ব্যবহার করতে হয়? তেলটি কি গরম করার প্রয়োজন আছে?',
        answer: [
            'না, আলাদা করে গরম করার কোনো প্রয়োজন নেই। কয়েক ফোঁটা তেল ব্যথার স্থানে লাগিয়ে ১–৩ মিনিট হালকা হাতে মালিশ করলেই তেলটি প্রাকৃতিকভাবে আরামদায়ক উষ্ণতার অনুভূতি (Warm Heat) তৈরি করে। দ্রুত ফলের জন্য দিনে ২ বার (সকালে ও রাতে ঘুমানোর আগে) ব্যবহার করা উত্তম। তবে বিভিন্ন মানুষের এবং দেহের বিভিন্ন স্থানে তাপ সহনশীলতার মাত্রা ভিন্ন হয়—তাই আপনি যে স্থানে প্রয়োগ করবেন, সে স্থানে প্রথমে খুব অল্প পরিমাণ দিয়ে কতটুকু তাপ সহনশীল তা বুঝে পরিমাণমতো ব্যবহার করবেন।',
        ],
    },
    {
        question:
            'কত বছর বয়স থেকে আবাবিল ব্যবহার করা যায়? অন্তঃসত্ত্বা মায়েরা বা বয়োজ্যেষ্ঠ ব্যক্তিরা কি এটি ব্যবহার করতে পারবেন?',
        answer: [
            '৩ বছরের বেশি বয়সী যেকোনো নারী-পুরুষ আবাবিল পেইন রিলিফ অয়েল ব্যবহার করতে পারবেন। তবে গর্ভকালীন সময় ও দুগ্ধদানকারী মায়েদের ক্ষেত্রে ব্যবহারের পূর্বে অবশ্যই বিশেষজ্ঞ চিকিৎসকের পরামর্শ নেওয়া উচিত। বয়োজ্যেষ্ঠদের ব্যথা দূর করতে এবং পেশি ও নার্ভ সক্রিয় রেখে আরাম দিতে আবাবিল পেইন রিলিফ অয়েল অতুলনীয় কাজ করে।',
        ],
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
                    {faqs.map(({ question, answer, list }, index) => (
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
                                <div className="mt-1 space-y-2 border-t border-amber-100 pt-3 pb-4 pl-11 font-bengali text-sm text-stone-600">
                                    {answer.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                    {list && (
                                        <ul className="list-disc space-y-1 pl-5 marker:text-amber-500">
                                            {list.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </div>
        </section>
    );
}
