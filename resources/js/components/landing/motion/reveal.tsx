import { motion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

const easeOut = [0.16, 1, 0.3, 1] as const;

export const staggerContainer: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.22,
            delayChildren: 0.1,
        },
    },
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 36 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 1.1, ease: easeOut },
    },
};

/** Fades + slides children up as they scroll into view, once. */
export default function Reveal({
    children,
    delay = 0,
    y = 28,
    className,
    as: Component = motion.div,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
    as?: typeof motion.div;
}) {
    return (
        <Component
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            transition={{ duration: 1.1, ease: easeOut, delay }}
            className={className}
        >
            {children}
        </Component>
    );
}

/** Wraps a list of children so they stagger-reveal together. */
export function RevealGroup({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '0px 0px -60px 0px' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function RevealItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div variants={staggerItem} className={className}>
            {children}
        </motion.div>
    );
}
