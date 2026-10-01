import { ArrowRight } from 'lucide-react';
import Magnetic from './motion/magnetic';
import Reveal from './motion/reveal';
import { Button } from '@/components/ui/button';

export default function OrderCtaBand({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-stone-950 py-10">
            <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
                <div>
                    <p className="font-bengali text-lg font-semibold text-white">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="mt-0.5 font-bengali text-sm text-neutral-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                <Magnetic strength={0.25}>
                    <Button
                        asChild
                        size="lg"
                        className="gap-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 font-bengali font-semibold text-stone-950 hover:brightness-105"
                    >
                        <a href="#order">
                            অর্ডার করুন
                            <ArrowRight className="size-4" />
                        </a>
                    </Button>
                </Magnetic>
            </Reveal>
        </div>
    );
}
