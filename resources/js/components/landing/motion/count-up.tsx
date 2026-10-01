import { useInView, useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

/** Animates a number counting up from 0 once it scrolls into view. */
export default function CountUp({
    value,
    className,
    prefix = '',
}: {
    value: number;
    className?: string;
    prefix?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const motionValue = useMotionValue(0);
    const spring = useSpring(motionValue, { stiffness: 50, damping: 16 });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (inView) {
            motionValue.set(value);
        }
    }, [inView, value, motionValue]);

    useEffect(() => {
        const unsubscribe = spring.on('change', (v) => {
            setDisplay(Math.round(v));
        });

        return unsubscribe;
    }, [spring]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {display}
        </span>
    );
}
