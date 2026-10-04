import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';

/** Glowing, pulsing order CTA that draws the eye and reacts to hover and press. */
export default function OrderButton({
    children,
    href = '#order',
    size = 'lg',
    className = '',
}: {
    children: ReactNode;
    href?: string;
    size?: 'sm' | 'lg';
    className?: string;
}) {
    const large = size === 'lg';

    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 font-bengali font-bold text-stone-950 shadow-xl ring-2 shadow-amber-500/25 ring-amber-200/80 transition-shadow hover:shadow-amber-500/40 ${
                large ? 'px-10 py-4 text-lg sm:text-xl' : 'px-6 py-2.5 text-sm'
            } ${className}`}
        >
            <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                initial={{ x: '-150%' }}
                animate={{ x: '350%' }}
                transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    repeatDelay: 1.4,
                    ease: 'easeInOut',
                }}
            />
            <span className="relative">{children}</span>
            <motion.span
                aria-hidden
                className="relative"
                animate={{ x: [0, 5, 0] }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            >
                <ArrowRight className={large ? 'size-5' : 'size-4'} />
            </motion.span>
        </motion.a>
    );
}
