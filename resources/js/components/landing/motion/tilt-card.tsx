import { motion, useMotionTemplate, useSpring } from 'motion/react';
import { type ReactNode, useRef } from 'react';

/**
 * Real perspective 3D tilt driven by cursor position, with a soft light
 * sweep layered on top — the Apple/Stripe-style hover effect. Falls back
 * to a static card on touch devices (no hover).
 */
export default function TiltCard({
    children,
    className,
    strength = 10,
    glare = true,
}: {
    children: ReactNode;
    className?: string;
    strength?: number;
    glare?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const rotateX = useSpring(0, { stiffness: 120, damping: 22 });
    const rotateY = useSpring(0, { stiffness: 120, damping: 22 });
    const glareX = useSpring(50, { stiffness: 120, damping: 26 });
    const glareY = useSpring(50, { stiffness: 120, damping: 26 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        rotateY.set((px - 0.5) * strength);
        rotateX.set((0.5 - py) * strength);
        glareX.set(px * 100);
        glareY.set(py * 100);
    }

    function handleMouseLeave() {
        rotateX.set(0);
        rotateY.set(0);
    }

    const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.35), transparent 60%)`;

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 900,
            }}
            className={className}
        >
            {children}
            {glare && (
                <motion.div
                    aria-hidden
                    style={{ background: glareBackground }}
                    className="pointer-events-none absolute inset-0 rounded-[inherit]"
                />
            )}
        </motion.div>
    );
}
