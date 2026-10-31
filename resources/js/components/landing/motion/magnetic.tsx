import { m, useSpring } from 'motion/react';
import { type ReactNode, useRef } from 'react';

// Pulling content toward the cursor only means anything with a real cursor
// hovering it - touchscreens have no persistent hover, so the effect never
// does anything there anyway. Checked once per mount (device input mode
// doesn't change mid-session), not reactively.
const isCoarsePointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;

/** Subtly pulls its content toward the cursor on hover — a magnetic CTA. */
export default function Magnetic({
    children,
    className,
    strength = 0.35,
}: {
    children: ReactNode;
    className?: string;
    strength?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useSpring(0, { stiffness: 50, damping: 15, mass: 0.5 });
    const y = useSpring(0, { stiffness: 50, damping: 15, mass: 0.5 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        const rect = ref.current?.getBoundingClientRect();

        if (!rect) {
            return;
        }

        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    if (isCoarsePointer()) {
        return <div className={className}>{children}</div>;
    }

    return (
        <m.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x, y }}
            className={className}
        >
            {children}
        </m.div>
    );
}
