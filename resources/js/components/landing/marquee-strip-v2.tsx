import { BadgeCheck, Leaf, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import Marquee from './motion/marquee';

const items = [
    { label: 'সারা বাংলাদেশে Cash on Delivery', icon: Truck },
    { label: 'বহু প্রাকৃতিক উপাদান', icon: Leaf },
    { label: '৩ দিনের Money-Back গ্যারান্টি', icon: ShieldCheck },
    { label: '১০০% অর্গানিক', icon: Sparkles },
    { label: 'অ্যালার্জিক ত্বকের জন্য নিরাপদ', icon: BadgeCheck },
];

/** Concept-2 fork of `marquee-strip.tsx` in the unified light theme. */
export default function MarqueeStripV2() {
    return (
        <div className="border-y border-amber-200 bg-amber-100 py-3">
            <Marquee>
                {items.map(({ label, icon: Icon }) => (
                    <span
                        key={label}
                        className="flex items-center gap-2 font-bengali text-sm font-medium whitespace-nowrap text-amber-900"
                    >
                        <Icon className="size-4 text-amber-600" />
                        {label}
                    </span>
                ))}
            </Marquee>
        </div>
    );
}
