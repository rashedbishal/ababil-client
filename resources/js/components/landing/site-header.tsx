import { ChevronDown, Phone } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import logo from '../../../images/landing/ababil-logo.webp';
import Magnetic from './motion/magnetic';
import OrderButton from './order-button';

export type NavLink = { href: string; label: string };
export type MobileNavLink = NavLink & { icon: string };

const defaultNavLinks: NavLink[] = [
    { href: '#problem', label: 'সমস্যা' },
    { href: '#usp', label: 'কেন আবাবিল' },
    { href: '#lab-tested', label: 'ল্যাব টেস্ট' },
    { href: '#delivery', label: 'ডেলিভারি' },
    { href: '#usage', label: 'ব্যবহার' },
    { href: '#reviews', label: 'রিভিউ' },
    { href: '#checkout', label: 'পেমেন্ট' },
];

// How far the user has to scroll before the docked bar's look morphs into
// the floating pill. The header is `sticky` throughout — it never unmounts
// or changes position mode, so there's no gap that can flash the page's
// white background; only its visual style (padding/radius/border) changes.
const DOCK_THRESHOLD = 64;

const defaultMobileNavLinks: MobileNavLink[] = [
    { href: '#top', label: 'হোম', icon: '🏠' },
    { href: '#problem', label: 'সমস্যা', icon: '⚡' },
    { href: '#usp', label: 'কেন আবাবিল', icon: '⭐' },
    { href: '#lab-tested', label: 'ল্যাব টেস্ট', icon: '🧪' },
    { href: '#delivery', label: 'ডেলিভারি', icon: '🚚' },
    { href: '#usage', label: 'ব্যবহার', icon: '📖' },
    { href: '#reviews', label: 'রিভিউ', icon: '💬' },
    { href: '#checkout', label: 'পেমেন্ট', icon: '💳' },
];

export default function SiteHeader({
    phone,
    navLinks = defaultNavLinks,
    mobileNavLinks = defaultMobileNavLinks,
}: {
    phone: string | null;
    // Each concept page has its own section ids, so the nav targets aren't
    // the same everywhere — defaults match the main design (welcome.tsx).
    navLinks?: NavLink[];
    mobileNavLinks?: MobileNavLink[];
}) {
    const [activeHref, setActiveHref] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    // Docked (flat, full-width) look at the very top of the page so the hero
    // banner underneath isn't obstructed; morphs into the floating pill look
    // once the user scrolls down a bit.
    const [isDocked, setIsDocked] = useState(true);

    useEffect(() => {
        // Section top/bottom offsets only change on resize or late layout
        // shifts (e.g. images loading in) — caching them means the scroll
        // handler below never has to force a synchronous layout read.
        let sectionRanges: { href: string; top: number; bottom: number }[] = [];
        let totalHeight = 0;

        const measure = () => {
            const scrollY = window.scrollY;
            totalHeight = document.documentElement.scrollHeight;
            sectionRanges = navLinks.flatMap((link) => {
                const el = document.querySelector(link.href);
                if (!el) return [];
                const rect = el.getBoundingClientRect();
                const top = rect.top + scrollY;
                return [{ href: link.href, top, bottom: top + rect.height }];
            });
        };

        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                const currentScroll = window.scrollY;
                const viewportHeight = window.innerHeight;

                setIsDocked(currentScroll < DOCK_THRESHOLD);

                if (currentScroll < 120) {
                    setActiveHref(null);
                    return;
                }

                if (currentScroll + viewportHeight >= totalHeight - 140) {
                    setActiveHref(navLinks[navLinks.length - 1]?.href ?? null);
                    return;
                }

                const viewportTarget = currentScroll + viewportHeight * 0.35;
                let currentActive: string | null = null;

                for (const { href, top, bottom } of sectionRanges) {
                    if (viewportTarget >= top && viewportTarget <= bottom) {
                        currentActive = href;
                    }
                }

                if (currentActive) {
                    setActiveHref(currentActive);
                }
            });
        };

        measure();
        handleScroll();

        let resizeTicking = false;
        const handleResize = () => {
            if (resizeTicking) return;
            resizeTicking = true;
            requestAnimationFrame(() => {
                resizeTicking = false;
                measure();
                handleScroll();
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);
        window.addEventListener('load', measure);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('load', measure);
        };
    }, [navLinks]);

    const activeLink = navLinks.find((l) => l.href === activeHref);
    const currentLabel = activeLink ? activeLink.label : 'আবাবিল';

    return (
        // `sticky` (never `fixed`/`absolute`) — it's a normal, in-flow block
        // at the very top of the page (so the hero below it is never
        // covered), and the browser pins it to the viewport top natively
        // once scrolling would otherwise carry it past `top-0`. Nothing
        // ever unmounts or swaps position mode, so there's no gap that can
        // flash the page's white background.
        <div className="sticky top-0 z-50">
            <div
                className={`pointer-events-none ${
                    isDocked ? 'px-0 pt-0' : 'px-3 pt-3 sm:px-4 sm:pt-4'
                }`}
            >
                <div
                    className={`pointer-events-auto relative ${
                        isDocked
                            ? 'mx-auto max-w-none rounded-none shadow-none'
                            : 'mx-auto max-w-5xl rounded-full shadow-[0_0_30px_-6px_rgba(251,191,36,0.45)]'
                    }`}
                >
                    <header
                        className={`relative flex h-16 items-center justify-between gap-2 border-amber-400/60 bg-stone-950/95 px-3 shadow-[0_18px_45px_-12px_rgba(0,0,0,0.35)] sm:gap-3 sm:px-5 sm:backdrop-blur-xl ${
                            isDocked
                                ? 'rounded-none border-x-0 border-t-0 border-b-2'
                                : 'rounded-full border-2'
                        }`}
                    >
                        {/* Decorative sheen/shimmer, clipped in their own layer so they
                        never interact with (or clip) the header's own border */}
                        <div
                            aria-hidden
                            className={`pointer-events-none absolute inset-[2px] overflow-hidden ${
                                isDocked ? 'rounded-none' : 'rounded-full'
                            }`}
                        >
                            {/* Glassy top sheen */}
                            <div
                                className={`absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent ${
                                    isDocked
                                        ? 'rounded-t-none'
                                        : 'rounded-t-full'
                                }`}
                            />

                            {/* Slow shimmer sweep — plain CSS animation, no
                                per-frame JS */}
                            <div className="animate-sheen-sweep absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent" />
                        </div>

                        {/* Brand Logo */}
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
                                className="size-7 sm:size-9"
                            />
                            <span className="font-bengali text-base font-semibold tracking-wide text-amber-300 transition-colors group-hover:text-amber-200 sm:text-lg">
                                আবাবিল
                            </span>
                        </a>

                        {/* Mobile Section Pill Trigger */}
                        <div className="relative flex min-w-0 items-center lg:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsMobileMenuOpen((prev) => !prev)
                                }
                                className="flex min-w-0 items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 font-bengali text-[11px] font-semibold whitespace-nowrap text-amber-300 shadow-inner backdrop-blur-md transition-all active:scale-95 sm:gap-1.5 sm:px-3.5 sm:text-sm"
                            >
                                <span className="truncate">{currentLabel}</span>
                                <ChevronDown
                                    className={`size-3 shrink-0 text-amber-400/80 transition-transform duration-300 sm:size-3.5 ${
                                        isMobileMenuOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="no-scrollbar hidden items-center gap-0.5 overflow-x-auto py-1 lg:flex">
                            {navLinks.map((link) => {
                                const isActive = activeHref === link.href;

                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setActiveHref(link.href)}
                                        className="relative shrink-0 rounded-full px-3 py-1.5 font-bengali text-sm font-medium whitespace-nowrap text-neutral-300 transition-colors hover:text-amber-300"
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="nav-active-pill"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 220,
                                                    damping: 25,
                                                }}
                                                className="absolute inset-0 rounded-full border border-amber-400/50 bg-amber-400/15 shadow-[0_0_12px_rgba(251,191,36,0.18)]"
                                            />
                                        )}
                                        <motion.span
                                            whileHover={{ y: -1 }}
                                            className={`relative z-10 ${isActive ? 'font-semibold text-amber-300' : ''}`}
                                        >
                                            {link.label}
                                        </motion.span>
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Right Action Items */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {phone && (
                                <a
                                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                                    className="hidden items-center gap-1.5 font-bengali text-sm text-neutral-300 transition hover:text-amber-300 xl:flex"
                                >
                                    <span className="animate-icon-pulse inline-flex">
                                        <Phone className="size-3.5" />
                                    </span>
                                    {phone}
                                </a>
                            )}

                            <Magnetic strength={0.25}>
                                <OrderButton
                                    size="sm"
                                    showArrow={false}
                                    className="max-sm:gap-0 max-sm:px-3.5 max-sm:py-1.5 max-sm:text-xs"
                                >
                                    অর্ডার করুন
                                </OrderButton>
                            </Magnetic>
                        </div>
                    </header>

                    {/* Mobile Dropdown Menu Overlay */}
                    <AnimatePresence>
                        {isMobileMenuOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
                                />

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.94,
                                        y: -10,
                                    }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.94, y: -10 }}
                                    transition={{
                                        duration: 0.25,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="absolute top-full left-1/2 z-50 mt-2 w-[92vw] max-w-xs -translate-x-1/2 overflow-hidden rounded-2xl border border-amber-400/30 bg-stone-950/95 p-2 shadow-2xl backdrop-blur-2xl lg:hidden"
                                >
                                    <div className="flex items-center justify-between border-b border-amber-400/15 px-3 py-2 font-bengali text-xs font-semibold text-amber-400/80">
                                        <span>ন্যাভিগেশন মেনু</span>
                                        <span className="size-1.5 rounded-full bg-amber-400" />
                                    </div>

                                    <div className="mt-1 flex flex-col gap-1">
                                        {mobileNavLinks.map((link) => {
                                            const isActive =
                                                activeHref === link.href ||
                                                (!activeHref &&
                                                    link.href === '#top');

                                            return (
                                                <a
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false,
                                                        )
                                                    }
                                                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 font-bengali text-sm font-medium transition-all ${
                                                        isActive
                                                            ? 'bg-amber-400/15 font-bold text-amber-300 shadow-sm ring-1 ring-amber-400/40'
                                                            : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                                    }`}
                                                >
                                                    <span className="flex min-w-0 items-center gap-2.5">
                                                        <span className="shrink-0 text-base">
                                                            {link.icon}
                                                        </span>
                                                        <span className="whitespace-nowrap">
                                                            {link.label}
                                                        </span>
                                                    </span>
                                                    {isActive && (
                                                        <span className="size-2 shrink-0 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                                                    )}
                                                </a>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
