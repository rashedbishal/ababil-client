import { motion } from 'motion/react';

/**
 * One-shot ring pulse that plays when a clickable image scrolls into view,
 * shown only on coarse-pointer (touch) devices — desktop relies on the
 * cursor instead. Place inside a `relative` ancestor.
 */
export default function TapHint({ className = '' }: { className?: string }) {
    return (
        <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: [0, 0.8, 0], scale: [0.7, 1, 1.15] }}
            viewport={{ once: true, margin: '-30% 0px' }}
            transition={{ duration: 1.3, ease: 'easeOut', delay: 0.4 }}
            className={`pointer-events-none absolute inset-0 hidden rounded-[inherit] border-2 border-amber-300/80 [@media(pointer:coarse)]:block ${className}`}
        />
    );
}
