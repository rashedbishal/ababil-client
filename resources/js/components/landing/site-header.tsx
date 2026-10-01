import { motion, useScroll, useTransform } from 'motion/react';
import { Phone } from 'lucide-react';
import logo from '../../../images/landing/ababil-logo.webp';
import Magnetic from './motion/magnetic';
import { Button } from '@/components/ui/button';

const navLinks = [
    { href: '#problem', label: 'সমস্যা' },
    { href: '#usp', label: 'কেন আবাবিল' },
    { href: '#ingredients', label: 'উপাদান' },
    { href: '#usage', label: 'ব্যবহার' },
    { href: '#reviews', label: 'রিভিউ' },
];

export default function SiteHeader({ phone }: { phone: string | null }) {
    const { scrollY } = useScroll();
    const scale = useTransform(scrollY, [0, 160], [1, 0.97]);
    const shadowOpacity = useTransform(scrollY, [0, 160], [0.25, 0.5]);
    const shadow = useTransform(
        shadowOpacity,
        (v) => `0 18px 45px -12px rgb(0 0 0 / ${v})`,
    );

    return (
        <div className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
            <motion.header
                style={{ scale, boxShadow: shadow }}
                className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-amber-400/20 bg-stone-950/95 px-3 py-2 backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-2.5"
            >
                <a href="#top" className="flex shrink-0 items-center gap-2">
                    <img
                        src={logo}
                        alt="Ababil"
                        className="size-8 rounded-lg sm:size-9"
                    />
                    <span className="font-bengali text-base font-semibold tracking-wide text-amber-300 sm:text-lg">
                        আবাবিল
                    </span>
                </a>

                <nav className="hidden items-center gap-0.5 lg:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="rounded-full px-3 py-1.5 font-bengali text-sm font-medium whitespace-nowrap text-neutral-300 transition hover:bg-white/5 hover:text-amber-300"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3">
                    {phone && (
                        <a
                            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                            className="hidden items-center gap-1.5 font-bengali text-sm text-neutral-300 transition hover:text-amber-300 md:flex"
                        >
                            <Phone className="size-3.5" />
                            {phone}
                        </a>
                    )}

                    <Magnetic strength={0.25}>
                        <Button
                            asChild
                            size="sm"
                            className="rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 font-bengali font-semibold text-stone-950 hover:brightness-105"
                        >
                            <a href="#order">অর্ডার করুন</a>
                        </Button>
                    </Magnetic>
                </div>
            </motion.header>
        </div>
    );
}
