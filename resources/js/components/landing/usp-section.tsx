import warmingImg from '../../../images/landing/cards/usp-warming.webp';
import nonstickyImg from '../../../images/landing/cards/usp-nonsticky.webp';
import massageImg from '../../../images/landing/cards/usp-massage.webp';
import skincareImg from '../../../images/landing/cards/usp-skincare.webp';
import arnicaImg from '../../../images/landing/cards/ing-arnica.webp';
import vitamineImg from '../../../images/landing/cards/ing-vitamine.webp';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import TiltCard from './motion/tilt-card';

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
        <section className="relative overflow-hidden bg-amber-100/60 py-14 sm:py-20">
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(217,161,65,0.15),transparent_45%)]"
            />
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal>
                    <h2 className="text-center font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        কেন আবাবিল বেছে নেবেন
                    </h2>
                </Reveal>

                <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {usps.map(({ title, description, image }) => (
                        <RevealItem key={title}>
                            <TiltCard
                                strength={5}
                                className="relative flex items-center gap-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-xl hover:shadow-amber-900/10"
                            >
                                <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-amber-300 shadow-inner">
                                    <img
                                        src={image}
                                        alt=""
                                        className="size-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bengali text-base font-semibold text-stone-900">
                                        {title}
                                    </h3>
                                    <p className="mt-1 font-bengali text-sm text-stone-600">
                                        {description}
                                    </p>
                                </div>
                            </TiltCard>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
