import { useInView, useMotionValue, useSpring } from 'motion/react';
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
    const spring = useSpring(motionValue, { stiffness: 24, damping: 20 });
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
        const timeout = setTimeout(() => setSettled(true), 3000);

        return () => clearTimeout(timeout);
    }, [inView, settled]);

    return (
        <span
            ref={ref}
            className={`relative inline-block tabular-nums ${className ?? ''}`}
        >
            {prefix}
            {display}
        </span>
    );
}
