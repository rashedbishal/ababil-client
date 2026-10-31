import { ArrowRight } from 'lucide-react';
import { useInView } from 'motion/react';
import { type ReactNode, useRef } from 'react';

/** Glowing, pulsing order CTA that draws the eye and reacts to hover and press. */
export default function OrderButton({
    children,
    href = '#checkout',
    onClick,
    size = 'lg',
    showArrow = true,
    className = '',
}: {
    children: ReactNode;
    href?: string;
    // When provided, the control never navigates — it runs this instead
    // (e.g. opening the order drawer rather than jumping to `href`).
    onClick?: () => void;
    size?: 'sm' | 'lg';
    showArrow?: boolean;
    className?: string;
}) {
    const large = size === 'lg';
    const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
    // Many of these buttons exist on the page at once — only the ones
    // actually on screen need their shimmer/arrow loops running.
    const isInView = useInView(ref, { margin: '200px' });

    // Press/hover scale is CSS, not Motion `whileTap`/`whileHover`. Motion's
    // tap gesture preventDefault()s pointerdown, which Facebook's in-app
    // browser races against the click (so onClick never fires) and often
    // treats as a navigation, reloading the page.
    const sharedClassName = `group relative inline-flex touch-manipulation items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 font-bengali font-bold whitespace-nowrap text-stone-950 shadow-xl ring-2 shadow-amber-500/25 ring-amber-200/80 transition-[transform,box-shadow] hover:-translate-y-0.5 hover:scale-105 hover:shadow-amber-500/40 active:scale-95 ${
        large ? 'px-10 py-4 text-lg sm:text-xl' : 'px-6 py-2.5 text-sm'
    } ${className}`;

    const content = (
        <>
            {/* Plain CSS animations (no per-frame JS) — only applied while
                the button is in view, toggling a class is effectively free. */}
            <span
                aria-hidden
                className={`pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent ${
                    isInView ? 'animate-cta-sheen-sweep' : ''
                }`}
            />
            <span className="relative">{children}</span>
            {showArrow && (
                <span
                    aria-hidden
                    className={`relative ${
                        isInView ? 'animate-cta-arrow-nudge' : ''
                    }`}
                >
                    <ArrowRight className={large ? 'size-5' : 'size-4'} />
                </span>
            )}
        </>
    );

    // When onClick is provided this never navigates anywhere, so it's a
    // real <button>, not an <a> whose default navigation has to be
    // suppressed via preventDefault() - Facebook's in-app browser webview
    // intercepts anchor taps with its own handling ahead of React's
    // synthetic event, racing preventDefault() and falling through to a
    // real navigation that reloads the page.
    if (onClick) {
        return (
            <button
                ref={ref}
                type="button"
                onClick={onClick}
                className={sharedClassName}
            >
                {content}
            </button>
        );
    }

    return (
        <a ref={ref} href={href} className={sharedClassName}>
            {content}
        </a>
    );
}
