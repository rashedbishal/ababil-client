import { useEffect, useState } from 'react';
import OrderButton from './order-button';

const SHOW_AFTER_SCROLL = 500;

export default function StickyOrderBar({ price }: { price: string }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // A plain threshold check + CSS transition, rather than a
        // continuously-updating Framer motion value tied to every scroll
        // frame for the page's whole lifetime — this only touches state
        // (and triggers a repaint) on the rare crossing of the threshold.
        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                ticking = false;
                setVisible(window.scrollY > SHOW_AFTER_SCROLL);
            });
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div
            className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-amber-500/20 bg-stone-950/95 px-4 py-3 transition-[opacity,transform] duration-300 ease-out sm:hidden ${
                visible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-5 opacity-0'
            }`}
        >
            <div className="font-bengali">
                <p className="text-[11px] text-neutral-400">মূল্য</p>
                <p className="text-lg font-bold text-amber-400">৳{price}</p>
            </div>
            <OrderButton size="sm">অর্ডার করুন</OrderButton>
        </div>
    );
}
