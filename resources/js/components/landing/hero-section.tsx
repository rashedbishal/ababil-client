import { motion, useMotionTemplate, useSpring } from 'motion/react';
import { useRef } from 'react';
import heroImage from '../../../images/landing/ababil-oil-glow.webp';
import CountUp from './motion/count-up';
import Magnetic from './motion/magnetic';
import Reveal from './motion/reveal';
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
    const imageRef = useRef<HTMLDivElement>(null);
    const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
    const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = imageRef.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        rotateY.set((px - 0.5) * 16);
        rotateX.set((0.5 - py) * 16);
    }

    function handleMouseLeave() {
        rotateX.set(0);
        rotateY.set(0);
    }

    const shadowOpacity = useMotionTemplate`drop-shadow(0 30px 40px rgb(120 72 0 / 0.35))`;

    return (
        <section
            id="top"
            className="relative overflow-hidden bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-400 pt-10 pb-20 sm:pt-16 sm:pb-28"
        >
            {/* Ambient floating gold orbs */}
            <div
                aria-hidden
                className="animate-float-slow absolute -top-20 -left-16 size-72 rounded-full bg-amber-100/50 blur-3xl"
            />
            <div
                aria-hidden
                className="animate-float-slow absolute top-1/3 -right-20 size-96 rounded-full bg-yellow-100/40 blur-3xl"
                style={{ animationDelay: '1.5s' }}
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgb(120,72,0,0.06)_100%)]"
            />

            <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8">
                <Reveal className="order-2 text-center lg:order-1 lg:text-left">
                    <span className="inline-block rounded-full border border-stone-900/15 bg-white/40 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-stone-800 backdrop-blur-sm">
                        ১০০% অর্গানিক · ৯টি প্রাকৃতিক উপাদান
                    </span>

                    <h1 className="mt-4 font-bengali text-3xl leading-tight font-bold text-stone-900 sm:text-4xl lg:text-5xl">
                        আবাবিল অর্গানিক
                        <span className="animate-shimmer mt-1 block bg-gradient-to-r from-amber-700 via-stone-900 to-amber-700 bg-clip-text text-transparent">
                            পেইন রিলিফ অয়েল
                        </span>
                    </h1>

                    <p className="mt-4 font-bengali text-base text-stone-700 sm:text-lg">
                        হাঁটু, ঘাড়, পিঠ ও কোমরের ব্যথায় দ্রুত আরাম দিতে ৯টি প্রাকৃতিক ভেষজ
                        উপাদানে তৈরি প্রিমিয়াম পেইন রিলিফ অয়েল।
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-3 font-bengali lg:justify-start">
                        {salePrice && (
                            <span className="text-2xl text-stone-500 line-through">
                                ৳{regularPrice}
                            </span>
                        )}
                        <span className="text-4xl font-bold text-stone-900">
                            ৳
                            <CountUp
                                value={Number(salePrice ?? regularPrice)}
                            />
                        </span>
                        <span className="text-sm text-stone-600">মাত্র</span>
                    </div>

                    <ul className="mt-6 space-y-2 font-bengali">
                        {trustPoints.map((point) => (
                            <li
                                key={point}
                                className="flex items-center justify-center gap-2 text-sm font-medium text-stone-800 lg:justify-start"
                            >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-[10px] text-amber-300">
                                    ✓
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8">
                        <Magnetic className="inline-block">
                            <Button
                                asChild
                                size="lg"
                                className="w-full bg-stone-900 font-bengali text-base font-semibold text-amber-300 shadow-lg shadow-stone-900/20 hover:bg-stone-800 sm:w-auto"
                            >
                                <a href="#order">এখনই অর্ডার করুন</a>
                            </Button>
                        </Magnetic>
                    </div>
                </Reveal>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="order-1 flex justify-center lg:order-2"
                >
                    <div
                        ref={imageRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        style={{ perspective: 1000 }}
                        className="relative flex size-full max-w-md items-center justify-center"
                    >
                        <div className="absolute inset-0 rounded-full bg-white/30 blur-3xl" />
                        <motion.img
                            style={{ rotateX, rotateY, filter: shadowOpacity }}
                            src={heroImage}
                            alt="আবাবিল অর্গানিক পেইন রিলিফ অয়েল"
                            className="animate-float-slow relative w-full max-w-sm will-change-transform"
                        />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
