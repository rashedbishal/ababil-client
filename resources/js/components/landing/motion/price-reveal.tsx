import { motion, useInView, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Counts down from the regular price to the discounted price once it
 * scrolls into view, then catches a repeating pass of light — instead of
 * counting up from zero.
 */
export default function PriceReveal({
    from,
    to,
    className,
    prefix = '',
}: {
    from: number;
    to: number;
    className?: string;
    prefix?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const motionValue = useMotionValue(from);
    const spring = useSpring(motionValue, { stiffness: 55, damping: 16 });
    const [display, setDisplay] = useState(Math.round(from));
    const [settled, setSettled] = useState(from === to);

    useEffect(() => {
        if (inView) {
            motionValue.set(to);
        }
    }, [inView, to, motionValue]);

    useEffect(() => {
        const unsubscribe = spring.on('change', (v) => {
            setDisplay(Math.round(v));
        });

        return unsubscribe;
    }, [spring]);

    useEffect(() => {
        if (!inView || settled) {
            return;
        }

        // The spring settles in well under this window — treat it as
        // "arrived" rather than chasing an exact completion event.
        const timeout = setTimeout(() => setSettled(true), 1400);

        return () => clearTimeout(timeout);
    }, [inView, settled]);

    return (
        <span
            ref={ref}
            className={`relative inline-block overflow-hidden tabular-nums ${className ?? ''}`}
        >
            {prefix}
            {display}

            {settled && (
                <motion.span
                    aria-hidden
                    initial={{ x: '-130%', opacity: 0 }}
                    animate={{ x: ['-130%', '230%'], opacity: [0, 1, 1, 0] }}
                    transition={{
                        duration: 1.3,
                        times: [0, 0.2, 0.8, 1],
                        delay: 0.3,
                        repeat: Infinity,
                        repeatDelay: 2.6,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent mix-blend-overlay"
                />
            )}
        </span>
    );
}
