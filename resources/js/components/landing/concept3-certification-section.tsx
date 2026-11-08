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
                {/* Flex-wrap (instead of grid) so an incomplete last row is centered. */}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 min-[560px]:gap-x-4">
                    {items.map((cert) => (
                        <div
                            key={cert.id}
                            className="flex w-[calc((100%-1.5rem)/3)] justify-center min-[560px]:w-[calc((100%-3rem)/4)] md:w-[calc((100%-4rem)/5)] lg:w-[calc((100%-5rem)/6)]"
                        >
                            <figure className="flex w-full max-w-[92px] flex-col items-center gap-2.5 sm:max-w-[140px] lg:max-w-[160px]">
                                {/* Image is absolutely positioned so tall logos can't stretch the square box. */}
                                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-amber-400/80 bg-white shadow-lg shadow-black/40">
                                    <img
                                        src={cert.image}
                                        alt={cert.label}
                                        draggable={false}
                                        className="absolute inset-2.5 h-[calc(100%-1.25rem)] w-[calc(100%-1.25rem)] object-contain sm:inset-3 sm:h-[calc(100%-1.5rem)] sm:w-[calc(100%-1.5rem)]"
                                    />
                                </div>
                                <figcaption className="flex min-h-[2.25rem] w-full items-center justify-center text-center text-[11px] leading-4 font-semibold text-stone-100 sm:min-h-[2.75rem] sm:text-xs sm:leading-5 lg:text-sm">
                                    {cert.label}
                                </figcaption>
                            </figure>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
