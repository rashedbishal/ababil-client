import Magnetic from './motion/magnetic';
import Reveal from './motion/reveal';
import OrderButton from './order-button';

export default function OrderCtaBand({
    title,
    subtitle,
}: {
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="bg-stone-950 py-6 sm:py-10">
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
                    <OrderButton>অর্ডার করুন</OrderButton>
                </Magnetic>
            </Reveal>
        </div>
    );
}
