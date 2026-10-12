import bcsir from '../../../images/landing/certifications/bcsir.webp';
import gmp from '../../../images/landing/certifications/gmp.webp';
import iso9001 from '../../../images/landing/certifications/iso-9001.webp';
import ukas from '../../../images/landing/certifications/ukas.webp';
import usac from '../../../images/landing/certifications/usac.webp';
import Marquee from './motion/marquee';

const certifications = [
    { id: 'gmp', image: gmp, label: 'GMP Certified' },
    { id: 'bcsir', image: bcsir, label: 'BCSIR Tested' },
    { id: 'usac', image: usac, label: 'USAC Accredited' },
    { id: 'ukas', image: ukas, label: 'UKAS Accredited' },
    { id: 'iso', image: iso9001, label: 'ISO 9001:2015 Certified' },
];

// One set of 5 tiles is narrower than a wide desktop screen, which would
// leave an empty gap at the end of each loop - so each Marquee set holds
// the logos several times over.
const REPEATS = 3;

/** Continuously scrolling strip of the product's certification logos. */
export default function Concept3CertificationSection() {
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
                {Array.from({ length: REPEATS }, (_, round) =>
                    certifications.map((cert) => (
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
                            <figcaption className="h-8 text-center text-xs leading-4 font-semibold text-stone-100 sm:h-10 sm:text-sm sm:leading-5">
                                {cert.label}
                            </figcaption>
                        </figure>
                    )),
                ).flat()}
            </Marquee>
        </section>
    );
}
