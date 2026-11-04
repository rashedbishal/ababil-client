import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import OrderTriggerButton from './order-trigger-button';

/**
 * Mobile sticky "অর্ডার করুন" bar (hidden on desktop) plus a floating
 * back-to-top button. The WhatsApp floating button is the shared
 * `FloatingActions` component instead (mounted alongside this one on the
 * page), so it stays consistent with `/`, concept 1 and concept 2.
 */
export default function Concept3StickyBar({
    onOrderClick,
}: {
    onOrderClick: () => void;
}) {
    const [showBackTop, setShowBackTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowBackTop(window.scrollY > 450);
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {showBackTop && (
                <button
                    type="button"
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    aria-label="পেজের উপরে যান"
                    className="fixed right-4 bottom-50 z-40 grid size-11 place-items-center rounded-full border border-amber-200 bg-white text-stone-700 shadow-lg sm:right-6 sm:bottom-36"
                >
                    <ArrowUp className="size-5" />
                </button>
            )}

            {/* The ::after extends the bar's background below the screen edge,
                so no page content peeks through under it when a mobile
                browser's toolbar or safe area leaves a gap beneath. */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center border-t border-amber-500/20 bg-stone-950/95 px-4 py-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-24 after:bg-stone-950 sm:hidden">
                <OrderTriggerButton
                    onClick={onOrderClick}
                    size="sm"
                    className="w-full justify-center"
                >
                    অর্ডার করুন
                </OrderTriggerButton>
            </div>
        </>
    );
}
