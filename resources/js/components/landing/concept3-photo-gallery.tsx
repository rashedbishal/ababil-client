export type Concept3PhotoItem = {
    id: string | number;
    image: string;
    alt: string;
    caption: string;
};

/**
 * A grid of clickable photo cards, each with a caption and a small
 * "অর্ডার করুন →" pill grained into the corner. Used for both the "ছবিতে
 * আবাবিল" (campaign/problem) and "নিজের যত্নও জরুরি" (USP) galleries -
 * clicking any card opens the order drawer directly (matching the design's
 * behaviour), there's no separate lightbox step.
 */
export default function Concept3PhotoGallery({
    id,
    heading,
    subtitle,
    items,
    onOrderClick,
    columns = 3,
}: {
    id: string;
    heading: string;
    subtitle: string;
    items: Concept3PhotoItem[];
    onOrderClick: () => void;
    columns?: 2 | 3;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-24 bg-gradient-to-b from-amber-50 via-white to-amber-50"
        >
            <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-8 sm:py-14">
                <h2 className="font-bengali text-[29px] font-bold text-stone-900 sm:text-4xl">
                    {heading}
                </h2>
                <p className="mt-2 font-bengali text-base text-stone-600">
                    {subtitle}
                </p>

                <div
                    className={`mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-5 ${
                        columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
                    }`}
                >
                    {items.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={onOrderClick}
                            aria-label={`${item.caption} — অর্ডার করুন`}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm shadow-amber-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                        >
                            <div className="aspect-square overflow-hidden bg-stone-950">
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading="lazy"
                                    className="size-full object-cover p-1 transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <span className="flex items-center justify-between gap-2 border-t border-amber-100 px-2.5 py-2 sm:px-3 sm:py-2.5">
                                <span className="flex-1 text-left font-bengali text-xs text-stone-700 sm:text-sm">
                                    {item.caption}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-2.5 py-1 font-bengali text-[11px] font-bold whitespace-nowrap text-stone-950 sm:px-3 sm:text-xs">
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
