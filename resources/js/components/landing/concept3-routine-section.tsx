import usageAmount from '../../../images/landing/cards/usage-amount-full.webp';
import usageCleanArea from '../../../images/landing/cards/usage-clean-area-full.webp';
import usageMassage from '../../../images/landing/cards/usage-massage-full.webp';
import usageRoutine from '../../../images/landing/cards/usage-routine-full.webp';

const steps = [
    {
        id: 'cleanse',
        image: usageCleanArea,
        alt: 'ম্যাসাজের প্রস্তুতি',
        title: 'যেখানে ব্যথা, সেখানে যত্ন',
    },
    {
        id: 'dispense',
        image: usageAmount,
        alt: 'অয়েল নেওয়া',
        title: 'অল্প অয়েলেই শুরু',
    },
    {
        id: 'massage',
        image: usageMassage,
        alt: 'ম্যাসাজ করা',
        title: 'আলতো হাতে ম্যাসাজ',
    },
    {
        id: 'routine',
        image: usageRoutine,
        alt: 'দৈনন্দিন যত্ন',
        title: 'যত্ন হোক নিয়মিত',
    },
];

/**
 * Concept 3's usage-steps section is purely illustrative - unlike the
 * other photo grids, these images are not click-to-order (matches the
 * design's `.usage-photo{cursor:default}` treatment).
 */
export default function Concept3RoutineSection() {
    return (
        <section
            id="routine"
            className="relative overflow-hidden bg-stone-950 py-10 sm:py-16"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.12),transparent_60%)]"
            />
            <div className="relative mx-auto max-w-[1240px] px-4 text-center sm:px-8">
                <h2 className="font-bengali text-[29px] font-bold text-white sm:text-4xl">
                    ব্যস্ত দিনের শেষে নিজের যত্ন
                </h2>
                <p className="mt-2 font-bengali text-base text-amber-200/80">
                    অল্প অয়েল, আলতো হাতে ম্যাসাজ — নিজের জন্য একটু সময়।
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-4">
                    {steps.map((step) => (
                        <div key={step.id} className="text-left">
                            <div className="aspect-square overflow-hidden rounded-2xl border border-amber-500/20 bg-stone-900">
                                <img
                                    src={step.image}
                                    alt={step.alt}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            </div>
                            <h3 className="mt-2.5 font-bengali text-base font-medium text-white sm:text-lg">
                                {step.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
