import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

export type ViewerImage = {
    id: number | string;
    src: string;
    alt: string;
};

/** Fullscreen, swipeable, tap-to-zoom product image viewer built on Radix Dialog. */
export default function ProductImageViewer({
    images,
    open,
    initialIndex = 0,
    onOpenChange,
}: {
    images: ViewerImage[];
    open: boolean;
    initialIndex?: number;
    onOpenChange: (open: boolean) => void;
}) {
    const [index, setIndex] = useState(initialIndex);
    const [zoomed, setZoomed] = useState(false);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    useEffect(() => {
        if (open) {
            setIndex(initialIndex);
            setZoomed(false);
        }
    }, [open, initialIndex]);

    const hasMultiple = images.length > 1;
    const active = images[index];

    const goTo = (newIndex: number) => {
        setZoomed(false);
        setIndex(((newIndex % images.length) + images.length) % images.length);
    };

    if (!active) return null;

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    className="fixed inset-0 z-50 flex flex-col outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft') goTo(index - 1);
                        if (e.key === 'ArrowRight') goTo(index + 1);
                    }}
                >
                    <DialogPrimitive.Title className="sr-only">
                        {active.alt}
                    </DialogPrimitive.Title>

                    {/* Top bar */}
                    <div className="z-10 flex items-center justify-between gap-4 p-4">
                        <span className="font-bengali text-sm text-amber-100/80">
                            {hasMultiple && `${index + 1} / ${images.length}`}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setZoomed((z) => !z)}
                                aria-label={zoomed ? 'জুম আউট' : 'জুম ইন'}
                                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-amber-100 backdrop-blur-md transition hover:bg-white/20"
                            >
                                {zoomed ? (
                                    <ZoomOut className="size-5" />
                                ) : (
                                    <ZoomIn className="size-5" />
                                )}
                            </button>
                            <DialogPrimitive.Close
                                aria-label="বন্ধ করুন"
                                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-amber-100 backdrop-blur-md transition hover:bg-white/20"
                            >
                                <X className="size-5" />
                            </DialogPrimitive.Close>
                        </div>
                    </div>

                    {/* Image stage */}
                    <div
                        className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-4"
                        onTouchStart={(e) =>
                            setTouchStartX(e.touches[0].clientX)
                        }
                        onTouchEnd={(e) => {
                            if (touchStartX === null || zoomed) return;
                            const deltaX =
                                e.changedTouches[0].clientX - touchStartX;
                            if (Math.abs(deltaX) > 50) {
                                goTo(deltaX > 0 ? index - 1 : index + 1);
                            }
                            setTouchStartX(null);
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={active.id}
                                src={active.src}
                                alt={active.alt}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{
                                    duration: 0.25,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                onClick={() => setZoomed((z) => !z)}
                                className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
                                    zoomed
                                        ? 'scale-150 cursor-zoom-out sm:scale-175'
                                        : 'cursor-zoom-in'
                                }`}
                            />
                        </AnimatePresence>

                        {hasMultiple && !zoomed && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => goTo(index - 1)}
                                    aria-label="পূর্ববর্তী ছবি"
                                    className="absolute left-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-amber-100 backdrop-blur-md transition hover:bg-white/20 sm:left-4"
                                >
                                    <ChevronLeft className="size-6" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => goTo(index + 1)}
                                    aria-label="পরবর্তী ছবি"
                                    className="absolute right-2 flex size-11 items-center justify-center rounded-full bg-white/10 text-amber-100 backdrop-blur-md transition hover:bg-white/20 sm:right-4"
                                >
                                    <ChevronRight className="size-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {hasMultiple && (
                        <div className="z-10 flex items-center justify-center gap-2 p-4">
                            {images.map((img, idx) => (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => goTo(idx)}
                                    aria-label={`ছবি ${idx + 1} দেখুন`}
                                    className={`size-2.5 rounded-full transition-all duration-300 ${
                                        idx === index
                                            ? 'w-6 bg-amber-400'
                                            : 'bg-white/30 hover:bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
