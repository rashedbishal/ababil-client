import { Children, type ReactNode } from 'react';

/**
 * An infinite, seamless horizontal scrolling strip.
 *
 * The gap between items is applied as a trailing margin on every tile
 * (including the last one of each duplicated set) rather than a flex `gap`.
 * That makes each tile's width self-contained, so two duplicated sets have
 * exactly equal widths and animating by exactly -50% loops with zero seam -
 * no gap or jump when it wraps back to the start.
 */
export default function Marquee({
    children,
    durationSeconds = 90,
    className,
}: {
    children: ReactNode;
    durationSeconds?: number;
    className?: string;
}) {
    const items = Children.toArray(children);
    const track = [...items, ...items];

    return (
        <div className={`overflow-hidden ${className ?? ''}`}>
            {/* Plain CSS animation (no Framer/JS per-frame cost) — cheap and
                always-on, which matters since this runs forever. */}
            <div
                className="animate-marquee-scroll flex w-max items-center"
                style={{ animationDuration: `${durationSeconds}s` }}
            >
                {track.map((child, i) => (
                    <span
                        key={i}
                        aria-hidden={i >= items.length}
                        className="mr-10 flex shrink-0 items-center"
                    >
                        {child}
                    </span>
                ))}
            </div>
        </div>
    );
}
