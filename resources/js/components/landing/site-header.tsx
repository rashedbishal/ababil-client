import { motion, useScroll, useTransform } from 'motion/react';
import { Phone } from 'lucide-react';
import logo from '../../../images/landing/ababil-logo.webp';
import Magnetic from './motion/magnetic';
import { Button } from '@/components/ui/button';

export default function SiteHeader({ phone }: { phone: string | null }) {
    const { scrollY } = useScroll();
    const paddingY = useTransform(scrollY, [0, 120], [16, 8]);
    const shadowOpacity = useTransform(scrollY, [0, 120], [0, 0.12]);

    return (
        <motion.header
            style={{ paddingTop: paddingY, paddingBottom: paddingY }}
            className="sticky top-0 z-40 border-b border-stone-900/10 bg-amber-50/85 backdrop-blur-md"
        >
            <motion.div
                aria-hidden
                style={{ opacity: shadowOpacity }}
                className="pointer-events-none absolute inset-x-0 top-full h-4 bg-gradient-to-b from-stone-900/20 to-transparent"
            />
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="Ababil"
                        className="h-9 w-9 rounded-lg shadow-sm"
                    />
                    <span className="font-bengali text-lg font-semibold tracking-wide text-stone-900">
                        আবাবিল
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                    {phone && (
                        <a
                            href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                            className="hidden items-center gap-1.5 text-sm text-stone-700 transition hover:text-amber-700 sm:flex"
                        >
                            <Phone className="size-4" />
                            {phone}
                        </a>
                    )}

                    <Magnetic strength={0.25}>
                        <Button
                            asChild
                            size="sm"
                            className="bg-stone-900 font-bengali font-semibold text-amber-300 hover:bg-stone-800"
                        >
                            <a href="#order">অর্ডার করুন</a>
                        </Button>
                    </Magnetic>
                </div>
            </div>
        </motion.header>
    );
}
