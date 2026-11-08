export type Concept3Partner = {
    id: number;
    image: string;
    label: string;
};

/** Even grid of partner certification logos, with centered final-row items. */
export default function Concept3CertificationSection({
    items,
}: {
    items: Concept3Partner[];
}) {
    if (items.length === 0) {
        return null;
    }

    return (
        <section
            id="certifications"
            className="border-b border-amber-500/20 bg-[#120e05] py-8 sm:py-10"
        >
            <div className="mx-auto max-w-[1240px] px-4 text-center sm:px-8">
                <h2 className="font-bengali text-2xl font-bold text-amber-400 sm:text-3xl">
                    গুণগত মানে আস্থার প্রতিশ্রুতি
                </h2>
                <p className="mt-1.5 font-bengali text-sm text-stone-300 sm:text-base">
                    গুণগত মান বজায় রাখতে আমরা প্রতিটি ধাপে যত্নশীল।
                </p>
            </div>

            <div className="mx-auto mt-6 max-w-[1240px] px-4 sm:mt-8 sm:px-8">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
                    {items.map((cert) => (
                        <figure
                            key={cert.id}
                            className="flex w-[30%] max-w-[120px] min-w-[90px] flex-col items-center justify-center gap-2.5 sm:w-[18%] lg:w-[18%]"
                        >
                            <div className="flex aspect-square w-full max-w-[120px] items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-white p-3 shadow-lg shadow-black/40 sm:max-w-[140px] lg:max-w-[160px]">
                                <img
                                    src={cert.image}
                                    alt={cert.label}
                                    draggable={false}
                                    className="size-full object-contain"
                                />
                            </div>
                            <figcaption className="line-clamp-2 h-8 text-center text-[11px] leading-4 font-semibold text-stone-100 sm:h-10 sm:text-xs sm:leading-5 lg:text-sm">
                                {cert.label}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}
