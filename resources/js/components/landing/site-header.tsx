import { motion, useScroll, useTransform } from 'motion/react';
import { Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import logo from '../../../images/landing/ababil-logo.webp';
import Magnetic from './motion/magnetic';
import OrderButton from './order-button';

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

    const [activeHref, setActiveHref] = useState<string | null>(null);

    useEffect(() => {
        const sections = navLinks
            .map((link) => document.querySelector(link.href))
            .filter((el): el is Element => el !== null);

        if (sections.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]) {
                    setActiveHref(`#${visible[0].target.id}`);
                }
            },
            {
                rootMargin: '-45% 0px -45% 0px',
                threshold: [0, 0.25, 0.5, 0.75, 1],
            },
        );

        sections.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
            <motion.div
                initial={{ opacity: 0, y: -48 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                style={{ scale }}
                className="pointer-events-auto relative mx-auto max-w-5xl rounded-full p-px"
            >
                <div
                    aria-hidden
                    className="animate-border-spin absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(251,191,36,0.9)_8%,transparent_22%,transparent_100%)] opacity-70"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 rounded-full border border-amber-400/15"
                />

                <motion.header
                    style={{ boxShadow: shadow }}
                    className="relative flex items-center justify-between gap-2 rounded-full bg-stone-950/95 px-3 py-2 backdrop-blur-xl sm:gap-3 sm:px-5 sm:py-2.5"
                >
                    <a
                        href="#top"
                        className="group flex shrink-0 items-center gap-2"
                    >
                        <motion.img
                            src={logo}
                            alt="Ababil"
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 150,
                                damping: 20,
                            }}
                            className="size-8 sm:size-9"
                        />
                        <span className="font-bengali text-base font-semibold tracking-wide text-amber-300 transition-colors group-hover:text-amber-200 sm:text-lg">
                            আবাবিল
                        </span>
                    </a>

                    <nav className="hidden items-center gap-0.5 lg:flex">
                        {navLinks.map((link) => {
                            const isActive = activeHref === link.href;

                            return (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="relative rounded-full px-3 py-1.5 font-bengali text-sm font-medium whitespace-nowrap text-neutral-300 transition-colors hover:text-amber-300"
                                >
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-active-pill"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 180,
                                                damping: 28,
                                            }}
                                            className="absolute inset-0 rounded-full bg-amber-400/10 ring-1 ring-amber-400/30"
                                        />
                                    )}
                                    <motion.span
                                        whileHover={{ y: -1 }}
                                        className={`relative z-10 ${isActive ? 'text-amber-300' : ''}`}
                                    >
                                        {link.label}
                                    </motion.span>
                                </a>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {phone && (
                            <a
                                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                                className="hidden items-center gap-1.5 font-bengali text-sm text-neutral-300 transition hover:text-amber-300 md:flex"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{
                                        duration: 4.5,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <Phone className="size-3.5" />
                                </motion.span>
                                {phone}
                            </a>
                        )}

                        <Magnetic strength={0.25}>
                            <OrderButton size="sm">অর্ডার করুন</OrderButton>
                        </Magnetic>
                    </div>
                </motion.header>
            </motion.div>
        </div>
    );
}
