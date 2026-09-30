import { motion } from 'motion/react';
import type { ReactNode } from 'react';

/** An infinite, seamless horizontal scrolling strip. */
export default function Marquee({
    children,
    durationSeconds = 22,
    className,
}: {
    children: ReactNode;
    durationSeconds?: number;
    className?: string;
}) {
    return (
        <div className={`overflow-hidden ${className ?? ''}`}>
            <motion.div
                className="flex w-max items-center gap-10"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                    duration: durationSeconds,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            >
                <div className="flex items-center gap-10">{children}</div>
                <div aria-hidden className="flex items-center gap-10">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
