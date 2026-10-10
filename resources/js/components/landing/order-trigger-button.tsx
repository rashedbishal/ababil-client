import { ArrowRight } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { type ReactNode, useRef } from 'react';

/**
 * Same animated chrome as `OrderButton`, but click-triggered instead of an
 * anchor scroll - used to open the shared `CheckoutDialog`. A sibling of
 * `OrderButton` rather than a modification of it, since `OrderButton` is
 * used throughout the live `/` page and must stay untouched.
 */
export default function OrderTriggerButton({
    children,
    onClick,
    size = 'lg',
    showArrow = true,
    className = '',
}: {
    children: ReactNode;
    onClick: () => void;
    size?: 'sm' | 'lg';
    showArrow?: boolean;
    className?: string;
}) {
    const large = size === 'lg';
    const ref = useRef<HTMLButtonElement>(null);
    const isInView = useInView(ref, { margin: '200px' });

    return (
        <motion.button
            ref={ref}
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 font-bengali font-bold whitespace-nowrap text-stone-950 shadow-xl ring-2 shadow-amber-500/25 ring-amber-200/80 transition-shadow hover:shadow-amber-500/40 ${
                large ? 'px-10 py-4 text-lg sm:text-xl' : 'px-6 py-2.5 text-sm'
            } ${className}`}
        >
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
        </motion.button>
    );
}
