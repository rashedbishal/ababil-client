import { CheckCircle2 } from 'lucide-react';
import heroImage from '../../../images/landing/ababil-oil-glow.webp';
import { Button } from '@/components/ui/button';

const trustPoints = [
    'সারা বাংলাদেশে Cash on Delivery',
    'দ্রুত শোষিত হয়',
    'আলাদা করে গরম করার প্রয়োজন নেই',
];

export default function HeroSection({
    regularPrice,
    salePrice,
}: {
    regularPrice: string;
    salePrice: string | null;
}) {
    return (
        <section className="relative overflow-hidden bg-neutral-950 pt-10 pb-16 sm:pt-16 sm:pb-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
                <div className="order-2 text-center lg:order-1 lg:text-left">
                    <h1 className="font-bengali text-3xl leading-tight font-bold text-white sm:text-4xl lg:text-5xl">
                        আবাবিল অর্গানিক
                        <span className="block text-amber-400">
                            পেইন রিলিফ অয়েল
                        </span>
                    </h1>

                    <p className="mt-4 font-bengali text-base text-neutral-300 sm:text-lg">
                        হাঁটু, ঘাড়, পিঠ ও কোমরের ব্যথায় দ্রুত আরাম দিতে ৯টি প্রাকৃতিক ভেষজ
                        উপাদানে তৈরি প্রিমিয়াম পেইন রিলিফ অয়েল।
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3 font-bengali lg:justify-start">
                        {salePrice && (
                            <span className="text-2xl text-neutral-500 line-through">
                                ৳{regularPrice}
                            </span>
                        )}
                        <span className="text-4xl font-bold text-amber-400">
                            ৳{salePrice ?? regularPrice}
                        </span>
                        <span className="text-sm text-neutral-400">মাত্র</span>
                    </div>

                    <ul className="mt-6 space-y-2 font-bengali">
                        {trustPoints.map((point) => (
                            <li
                                key={point}
                                className="flex items-center justify-center gap-2 text-sm text-neutral-200 lg:justify-start"
                            >
                                <CheckCircle2 className="size-4 shrink-0 text-amber-500" />
                                {point}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="w-full bg-amber-500 font-bengali text-base font-semibold text-neutral-950 hover:bg-amber-400 sm:w-auto"
                        >
                            <a href="#order">এখনই অর্ডার করুন</a>
                        </Button>
                    </div>
                </div>

                <div className="order-1 flex justify-center lg:order-2">
                    <div className="relative flex size-full max-w-md items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl" />
                        <img
                            src={heroImage}
                            alt="আবাবিল অর্গানিক পেইন রিলিফ অয়েল"
                            className="relative w-full max-w-sm"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
