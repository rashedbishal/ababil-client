import type { Concept3PhotoItem } from '@/components/landing/concept3-photo-gallery';

/**
 * Concept 3's "where it hurts" section is purely illustrative - unlike the
 * other photo grids, these images are not click-to-order (matches the
 * design's `.usage-photo{cursor:default}` treatment).
 */
export default function Concept3RoutineSection({
    items,
}: {
    items: Concept3PhotoItem[];
}) {
    return (
        <section
            id="routine"
            className="relative scroll-mt-24 overflow-hidden bg-stone-950 py-10 sm:py-16"
        >
            <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(217,161,65,0.12),transparent_60%)]"
            />
            <div className="relative mx-auto max-w-[1240px] px-4 text-center sm:px-8">
                <h2 className="font-bengali text-[29px] font-bold text-white sm:text-4xl">
                    কাঁধ থেকে পায়ের তলা
                </h2>
                <p className="mt-2 font-bengali text-base text-amber-200/80">
                    কাঁধ, পিঠ, কোমর, হাঁটু কিংবা পা — ব্যথা যেখানেই,{' '}
                    <span className="whitespace-nowrap">আবাবিল সেখানেই।</span>
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 lg:mx-auto lg:max-w-3xl">
                    {items.map((step) => (
                        <div key={step.id} className="text-left">
                            <div className="aspect-square overflow-hidden rounded-2xl border border-amber-500/20 bg-stone-900">
                                <img
                                    src={step.image}
                                    alt={step.alt}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            </div>
                            <h3 className="mt-2.5 line-clamp-4 font-bengali text-base font-medium text-white sm:text-lg">
                                {step.caption}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
