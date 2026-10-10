import { CheckCircle2, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import Reveal, { RevealGroup, RevealItem } from './motion/reveal';
import OrderButton from './order-button';
import ProductImageViewer, { type ViewerImage } from './product-image-viewer';

export type GalleryItem = {
    id: string | number;
    image: string;
    alt: string;
    title?: string;
    description?: string;
    features?: string[];
};

/**
 * A plain, non-slider image grid - used by the design-concept pages in
 * place of the carousels/alternating-scroll layouts on the live `/` page
 * (`UspSection`, `UsageGuideSection`, `ProblemSection`'s alternating rows).
 *
 * - `image-only`: just the image + a small icon-only order button grained
 *   into the image corner (concept 1's galleries).
 * - `image-with-copy`: also renders title/description/feature-checklist,
 *   with a full-width CTA below the image (concept 2's USP/usage galleries).
 * - `minimal`: like `image-only` but with a short title under the image
 *   and a tap-to-enlarge lightbox (concept 2's relief-areas gallery).
 */
export default function GallerySection({
    id,
    eyebrow,
    heading,
    items,
    layout,
    ctaHref = '#payment',
    ctaLabel = 'অর্ডার করুন',
}: {
    id: string;
    eyebrow: string;
    heading: string;
    items: GalleryItem[];
    layout: 'image-only' | 'image-with-copy' | 'minimal';
    ctaHref?: string;
    ctaLabel?: string;
}) {
    const [viewerIndex, setViewerIndex] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const enlargeOnClick = layout === 'minimal';

    const viewerImages: ViewerImage[] = items.map((item) => ({
        id: item.id,
        src: item.image,
        alt: item.alt,
    }));

    return (
        <section
            id={id}
            className="scroll-mt-24 bg-gradient-to-b from-amber-50 via-white to-amber-50 py-8 sm:py-14"
        >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <span className="inline-block rounded-full border border-amber-300/60 bg-amber-100/60 px-4 py-1 font-bengali text-xs font-semibold tracking-wide text-amber-800">
                        {eyebrow}
                    </span>
                    <h2 className="mt-4 font-bengali text-2xl font-bold text-stone-900 sm:text-3xl">
                        {heading}
                    </h2>
                </Reveal>

                <RevealGroup
                    className={
                        layout === 'image-with-copy'
                            ? 'mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3'
                            : 'mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4'
                    }
                >
                    {items.map((item, index) => (
                        <RevealItem
                            key={item.id}
                            className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm shadow-amber-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg"
                        >
                            <div className="relative aspect-square overflow-hidden bg-stone-950">
                                {enlargeOnClick ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setViewerIndex(index);
                                            setViewerOpen(true);
                                        }}
                                        aria-label={`${item.alt} - বড় করে দেখুন`}
                                        className="size-full"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.alt}
                                            loading="lazy"
                                            decoding="async"
                                            className="size-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </button>
                                ) : (
                                    <img
                                        src={item.image}
                                        alt={item.alt}
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}

                                {layout !== 'image-with-copy' && (
                                    <a
                                        href={ctaHref}
                                        aria-label={ctaLabel}
                                        className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-lg ring-2 ring-white/80 transition-transform hover:scale-110"
                                    >
                                        <ShoppingCart className="size-4" />
                                    </a>
                                )}
                            </div>

                            {layout === 'image-with-copy' && (
                                <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                                    {item.title && (
                                        <h3 className="font-bengali text-lg font-bold text-stone-900">
                                            {item.title}
                                        </h3>
                                    )}
                                    {item.description && (
                                        <p className="font-bengali text-sm leading-relaxed text-stone-600">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.features && (
                                        <ul className="mt-1 space-y-1.5 font-bengali text-xs font-medium text-stone-800">
                                            {item.features.map((feat) => (
                                                <li
                                                    key={feat}
                                                    className="flex items-start gap-1.5"
                                                >
                                                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                                                    <span>{feat}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {layout === 'minimal' && item.title && (
                                <div className="p-2.5 text-center sm:p-3">
                                    <p className="font-bengali text-xs font-semibold text-stone-800 sm:text-sm">
                                        {item.title}
                                    </p>
                                </div>
                            )}

                            {layout === 'image-with-copy' && (
                                <div className="flex justify-center p-3 pt-0 sm:p-4 sm:pt-0">
                                    <OrderButton
                                        size="sm"
                                        href={ctaHref}
                                        showArrow={false}
                                        className="w-full"
                                    >
                                        {ctaLabel}
                                    </OrderButton>
                                </div>
                            )}
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>

            {enlargeOnClick && (
                <ProductImageViewer
                    images={viewerImages}
                    initialIndex={viewerIndex}
                    open={viewerOpen}
                    onOpenChange={setViewerOpen}
                />
            )}
        </section>
    );
}
