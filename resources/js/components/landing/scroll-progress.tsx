import { motion, useScroll, useSpring } from 'motion/react';

/** Thin gold progress bar pinned to the top, reflecting scroll position. */
export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 200,
        damping: 40,
        restDelta: 0.001,
    });

    return (
        <motion.div
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-500"
        />
    );
}
