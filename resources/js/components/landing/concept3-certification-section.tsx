import Marquee from './motion/marquee';

export type Concept3Partner = {
    id: number;
    image: string;
    label: string;
};

// A set of tiles narrower than a wide desktop screen would leave an empty
// gap at the end of each loop - so each Marquee set holds the logos
// repeated enough times to be at least this many tiles long (3 rounds of the
// original 5 logos).
const MIN_TILES_PER_SET = 15;

/** Continuously scrolling strip of the product's certification logos. */
export default function Concept3CertificationSection({
    items,
}: {
    items: Concept3Partner[];
}) {
    const repeats = Math.max(1, Math.ceil(MIN_TILES_PER_SET / items.length));

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

            <Marquee
                durationSeconds={45}
                className="mt-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] sm:mt-8"
            >
                {Array.from({ length: repeats }, (_, round) =>
                    items.map((cert) => (
                        <figure
                            key={`${cert.id}-${round}`}
                            aria-hidden={round > 0 || undefined}
                            className="flex w-28 flex-col items-center gap-2.5 sm:w-36"
                        >
                            {/* Fixed square, never shrinks - every box is the
                                same size whatever the logo's proportions. */}
                            <div className="flex aspect-square size-24 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-white p-3 shadow-lg shadow-black/40 sm:size-28">
                                <img
                                    src={cert.image}
                                    alt={round > 0 ? '' : cert.label}
                                    draggable={false}
                                    className="size-full object-contain"
                                />
                            </div>
                            {/* Every caption reserves the same two-line height,
                                top-aligned, so a label that wraps (ISO) makes
                                its tile no taller than the rest and all the
                                boxes stay on one level. */}
                            <figcaption className="line-clamp-2 h-8 text-center text-xs leading-4 font-semibold text-stone-100 sm:h-10 sm:text-sm sm:leading-5">
                                {cert.label}
                            </figcaption>
                        </figure>
                    )),
                ).flat()}
            </Marquee>
        </section>
    );
}
