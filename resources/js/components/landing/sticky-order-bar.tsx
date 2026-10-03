import { motion, useScroll, useTransform } from 'motion/react';
import OrderButton from './order-button';

export default function StickyOrderBar({ price }: { price: string }) {
    const { scrollY } = useScroll();
    const opacity = useTransform(scrollY, [400, 600], [0, 1]);
    const y = useTransform(scrollY, [400, 600], [20, 0]);

    return (
        <motion.div
            style={{ opacity, y }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-amber-500/20 bg-stone-950/95 px-4 py-3 backdrop-blur-md sm:hidden"
        >
            <div className="font-bengali">
                <p className="text-[11px] text-neutral-400">মূল্য</p>
                <p className="text-lg font-bold text-amber-400">৳{price}</p>
            </div>
            <OrderButton size="sm">অর্ডার করুন</OrderButton>
        </motion.div>
    );
}
