import { motion, useInView } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { type ReactNode, useRef } from 'react';

/** Glowing, pulsing order CTA that draws the eye and reacts to hover and press. */
export default function OrderButton({
    children,
    href = '#checkout',
    size = 'lg',
    showArrow = true,
    className = '',
}: {
    children: ReactNode;
    href?: string;
    size?: 'sm' | 'lg';
    showArrow?: boolean;
    className?: string;
}) {
    const large = size === 'lg';
    const ref = useRef<HTMLAnchorElement>(null);
    // Many of these buttons exist on the page at once — only the ones
    // actually on screen need their shimmer/arrow loops running.
    const isInView = useInView(ref, { margin: '200px' });

    return (
        <motion.a
            ref={ref}
            href={href}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 font-bengali font-bold whitespace-nowrap text-stone-950 shadow-xl ring-2 shadow-amber-500/25 ring-amber-200/80 transition-shadow hover:shadow-amber-500/40 ${
                large ? 'px-10 py-4 text-lg sm:text-xl' : 'px-6 py-2.5 text-sm'
            } ${className}`}
        >
            {/* Plain CSS animations (no per-frame JS) — only applied while
                the button is in view, toggling a class is effectively free. */}
            <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent ${
                    isInView ? 'animate-cta-sheen-sweep' : ''
                }`}
            />
            <span className="relative">{children}</span>
            {showArrow && (
                <span
                    aria-hidden
                    className={`relative ${
                        isInView ? 'animate-cta-arrow-nudge' : ''
                    }`}
                >
                    <ArrowRight className={large ? 'size-5' : 'size-4'} />
                </span>
            )}
        </motion.a>
    );
}
