export type Concept3PhotoItem = {
    id: string | number;
    image: string;
    alt: string;
    caption: string;
};

/**
 * A grid of clickable photo cards, each with a caption and a small
 * "অর্ডার করুন →" pill grained into the corner. Used for both the "ছবিতে
 * আবাবিল" (campaign/problem) and "সবার স্বস্তি, সবার যত্ন" (USP) galleries -
 * clicking any card opens the order drawer directly (matching the design's
 * behaviour), there's no separate lightbox step.
 */
export default function Concept3PhotoGallery({
    id,
    heading,
    subtitle,
    items,
    onOrderClick,
}: {
    id: string;
    heading: string;
    subtitle: string;
    items: Concept3PhotoItem[];
    onOrderClick: () => void;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-24 bg-gradient-to-b from-amber-50 via-white to-amber-50"
        >
            <div className="mx-auto max-w-[1240px] px-4 py-6 sm:px-8 sm:py-8">
                <h2 className="font-bengali text-[29px] leading-tight font-bold text-stone-900 sm:text-4xl lg:text-center">
                    {heading}
                </h2>
                <p className="mt-0.5 font-bengali text-base leading-snug text-stone-600 lg:text-center">
                    {subtitle}
                </p>

                {/* 2 per row on mobile and tablet, 4 on desktop. A flex row that
                    wraps (not a grid) so an incomplete last row is centred
                    instead of leaving a lone card on the left. */}
                <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-5">
                    {items.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={onOrderClick}
                            aria-label={`${item.caption} — অর্ডার করুন`}
                            className="group relative flex w-[calc((100%-0.75rem)/2)] flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm shadow-amber-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
                        >
                            <div className="aspect-square overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading="lazy"
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <span className="flex flex-1 flex-col gap-2 border-t border-amber-100 px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:py-2.5 lg:flex-col lg:items-stretch lg:justify-start">
                                <span className="line-clamp-4 w-full text-left font-bengali text-xs text-stone-700 sm:flex-1 sm:text-sm lg:flex-none">
                                    {item.caption}
                                </span>
                                <span className="mt-auto inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-2.5 py-1.5 font-bengali text-[11px] font-bold whitespace-nowrap text-stone-950 sm:w-auto sm:px-3 sm:py-1 sm:text-xs lg:w-full lg:py-1.5">
                                    অর্ডার করুন →
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
