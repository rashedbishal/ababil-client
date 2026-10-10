import {
    BadgeCheck,
    Clock,
    MapPinned,
    PhoneCall,
    ShieldCheck,
    Truck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import mapImage from '../../../images/landing/bangladesh-map.webp';
import Reveal from './motion/reveal';

// Coordinates (% of the map image) were picked by hand against the artwork
// so each dot sits on clear land for that division - never on the
// illustrated figures, the river, or outside the map's silhouette.
const pins = [
    { label: 'রংপুর', x: 24, y: 9 },
    { label: 'রাজশাহী', x: 18, y: 32 },
    { label: 'সিলেট', x: 73, y: 26 },
    { label: 'খুলনা', x: 25, y: 58 },
    { label: 'চট্টগ্রাম', x: 87, y: 49 },
    { label: 'চট্টগ্রাম (পার্বত্য)', x: 92, y: 62 },
];

const callouts = [
    {
        icon: MapPinned,
        text: '৮ বিভাগ, ৬৪ জেলা জুড়ে ডেলিভারি',
        pos: 'top-[2%] left-0 lg:left-[-2%]',
        floatDelay: 0,
    },
    {
        icon: Truck,
        text: 'সারা বাংলাদেশে হোম ডেলিভারি',
        pos: 'top-0 right-0 lg:right-[-2%]',
        floatDelay: 0.6,
    },
    {
        icon: Clock,
        text: 'মাত্র ৩-৫ দিনে হাতে পাবেন',
        pos: 'top-[46%] -left-4 lg:left-[-8%]',
        floatDelay: 1.2,
    },
    {
        icon: BadgeCheck,
        text: 'ক্যাশ অন ডেলিভারি সুবিধা',
        pos: 'top-[48%] -right-4 lg:right-[-8%]',
        floatDelay: 0.3,
    },
    {
        icon: ShieldCheck,
        text: '৩ দিনের মানি-ব্যাক গ্যারান্টি',
        pos: 'bottom-[2%] left-0 lg:left-[0%]',
        floatDelay: 0.9,
    },
    {
        icon: PhoneCall,
        text: 'অর্ডার কনফার্মেশন কলে',
        pos: 'bottom-0 right-0 lg:right-[0%]',
        floatDelay: 1.5,
    },
];

type Line = { x1: number; y1: number; x2: number; y2: number };

function Pin({
    x,
    y,
    delay,
    innerRef,
}: {
    x: number;
    y: number;
    delay: number;
    innerRef?: (el: HTMLDivElement | null) => void;
}) {
    return (
        <div
            ref={innerRef}
            className="absolute z-[7] hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            <span className="relative flex size-2 sm:size-3.5">
                <span
                    className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-amber-500"
                    style={{ animationDelay: `${delay}s` }}
                />
                <span className="relative inline-flex size-2 rounded-full bg-stone-950 ring-1 ring-amber-200 sm:size-3.5 sm:ring-2" />
            </span>
        </div>
    );
}

export default function NationwideSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const pinRefs = useRef<(HTMLDivElement | null)[]>([]);
    const calloutRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [lines, setLines] = useState<Line[]>([]);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const computeLines = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        setCanvasSize({
            width: containerRect.width,
            height: containerRect.height,
        });

        const pinCenters = pinRefs.current.map((el) => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {
                x: r.left + r.width / 2 - containerRect.left,
                y: r.top + r.height / 2 - containerRect.top,
            };
        });

        const validPins = pinCenters.filter(
            (p): p is { x: number; y: number } => p !== null,
        );

        const nextLines: Line[] = [];
        calloutRefs.current.forEach((el) => {
            if (!el) return;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2 - containerRect.left;
            const cy = r.top + r.height / 2 - containerRect.top;

            let nearestIndex = -1;
            let nearestDist = Infinity;
            for (let i = 0; i < validPins.length; i++) {
                const p = validPins[i];
                const dist = (p.x - cx) ** 2 + (p.y - cy) ** 2;
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIndex = i;
                }
            }

            if (nearestIndex !== -1) {
                const nearest = validPins[nearestIndex];
                nextLines.push({
                    x1: cx,
                    y1: cy,
                    x2: nearest.x,
                    y2: nearest.y,
                });
            }
        });

        setLines(nextLines);
    }, []);

    useEffect(() => {
        const raf = requestAnimationFrame(() => computeLines());
        const timeout = window.setTimeout(computeLines, 2900);

        window.addEventListener('resize', computeLines);

        let observer: ResizeObserver | undefined;
        if (containerRef.current && 'ResizeObserver' in window) {
            observer = new ResizeObserver(() => computeLines());
            observer.observe(containerRef.current);
        }

        return () => {
            cancelAnimationFrame(raf);
            window.clearTimeout(timeout);
            window.removeEventListener('resize', computeLines);
            observer?.disconnect();
        };
    }, [computeLines]);

    return (
        <section
            id="delivery"
            className="relative scroll-mt-24 overflow-hidden bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-400 py-10 sm:py-20"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,250,220,0.35),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(120,72,0,0.14),transparent_50%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.18),transparent_55%)]"
            />
            <div
                aria-hidden
                className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_50%_0%,transparent_0,transparent_60px,rgb(120,72,0,0.05)_61px)]"
            />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-stone-900/15 bg-white/40 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-stone-800 backdrop-blur-sm">
                        নেশনওয়াইড হোম ডেলিভারি
                    </span>
                    <h2 className="mt-4 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl lg:text-4xl">
                        দেশের প্রতিটি প্রান্তে পৌঁছে যাচ্ছে আবাবিল
                    </h2>
                </Reveal>

                <div
                    ref={containerRef}
                    className="relative mx-auto mt-6 max-w-md py-6 sm:mt-10 sm:py-10 lg:max-w-3xl lg:py-14"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 2.7, ease: [0.16, 1, 0.3, 1] }}
                        onAnimationComplete={computeLines}
                        className="relative mx-auto max-w-md lg:max-w-2xl"
                    >
                        <div
                            aria-hidden
                            className="absolute inset-0 hidden scale-90 rounded-full bg-white/25 blur-3xl md:block"
                        />
                        <img
                            src={mapImage}
                            alt="সারা বাংলাদেশে আবাবিল হোম ডেলিভারি"
                            loading="lazy"
                            decoding="async"
                            onLoad={computeLines}
                            className="relative w-full drop-shadow-[0_35px_45px_rgba(87,53,0,0.35)]"
                        />
                        {pins.map((pin, i) => (
                            <Pin
                                key={pin.label}
                                x={pin.x}
                                y={pin.y}
                                delay={i * 0.3}
                                innerRef={(el) => {
                                    pinRefs.current[i] = el;
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Leader lines connecting each floating card to its nearest delivery point */}
                    <svg
                        className="pointer-events-none absolute inset-0 z-[6] hidden lg:block"
                        width={canvasSize.width}
                        height={canvasSize.height}
                        aria-hidden
                    >
                        {lines.map((line, i) => (
                            <line
                                key={i}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="rgba(41,37,36,0.45)"
                                strokeWidth={1.5}
                                strokeDasharray="5 5"
                                strokeLinecap="round"
                            />
                        ))}
                    </svg>

                    {callouts.map(
                        ({ icon: Icon, text, pos, floatDelay }, i) => (
                            <div
                                key={text}
                                ref={(el) => {
                                    calloutRefs.current[i] = el;
                                }}
                                className={`absolute z-10 hidden max-w-[13rem] lg:block ${pos}`}
                            >
                                <Reveal delay={0.2 + i * 0.12}>
                                    <div
                                        className="animate-float-slow flex items-center gap-3 rounded-2xl border border-amber-300/30 bg-stone-950/90 px-4 py-3.5 shadow-2xl shadow-stone-950/30 backdrop-blur-md"
                                        style={{
                                            animationDelay: `${floatDelay}s`,
                                        }}
                                    >
                                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-950">
                                            <Icon className="size-5" />
                                        </span>
                                        <span className="font-bengali text-sm leading-snug font-medium text-white">
                                            {text}
                                        </span>
                                    </div>
                                </Reveal>
                            </div>
                        ),
                    )}
                </div>

                <Reveal delay={0.15}>
                    <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
                        {callouts.map(({ icon: Icon, text }) => (
                            <div
                                key={text}
                                className="flex items-center gap-2.5 rounded-2xl border border-amber-300/30 bg-stone-950/90 px-3.5 py-3 shadow-lg backdrop-blur-sm"
                            >
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-stone-950">
                                    <Icon className="size-4" />
                                </span>
                                <span className="font-bengali text-xs leading-snug font-medium text-white">
                                    {text}
                                </span>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
