import Magnetic from './motion/magnetic';
import Reveal from './motion/reveal';
import OrderButton from './order-button';

/**
 * Concept-2 fork of `order-cta-band.tsx` in the unified light theme, and
 * pointed at `#payment` (concept-2 has no inline `#checkout` section).
 */
export default function OrderCtaBandV2({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-amber-500/10 py-6 sm:py-8">
            <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
                <div>
                    <p className="font-bengali text-lg font-semibold text-stone-900">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="mt-0.5 font-bengali text-sm text-stone-600">
                            {subtitle}
                        </p>
                    )}
                </div>

                <Magnetic strength={0.25}>
                    <OrderButton href="#payment">অর্ডার করুন</OrderButton>
                </Magnetic>
            </Reveal>
        </div>
    );
}
