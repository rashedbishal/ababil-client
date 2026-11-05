import { router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    ImagePlus,
    Replace,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import productImages from '@/routes/admin/products/images';

export type ProductImage = { id: number; image_url: string };

export type ImageSpec = { size: number; max_kb: number };

// `null` = adding a new image, otherwise replacing that image's file.
type Editing = { image: ProductImage | null };

export function ProductImagesManager({
    productId,
    images,
    imageSpec,
}: {
    productId: number;
    images: ProductImage[];
    imageSpec: ImageSpec;
}) {
    const [editing, setEditing] = useState<Editing | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const form = useForm<{ image: File | null }>({ image: null });

    // A local preview of the file picked in the dialog, released when it's
    // replaced or the dialog closes.
    useEffect(() => {
        if (!form.data.image) {
            setPreview(null);
            setDimensions(null);

            return;
        }

        const url = URL.createObjectURL(form.data.image);
        setPreview(url);
        setDimensions(null);

        const probe = new Image();
        probe.onload = () =>
            setDimensions({
                width: probe.naturalWidth,
                height: probe.naturalHeight,
            });
        probe.src = url;

        return () => {
            probe.onload = null;
            URL.revokeObjectURL(url);
        };
    }, [form.data.image]);

    // Format and file size are hard limits (the server rejects them); the
    // exact pixel size is only a warning, since the server converts an image
    // that isn't the right size.
    const file = form.data.image;
    const fileProblem = !file
        ? null
        : file.type !== 'image/webp'
          ? 'This is not a WebP file. Only .webp images are accepted.'
          : file.size > imageSpec.max_kb * 1024
            ? `This file is ${(file.size / 1024 / 1024).toFixed(2)} MB. The limit is ${imageSpec.max_kb / 1024} MB.`
            : null;
    const needsConversion =
        !fileProblem &&
        dimensions !== null &&
        (dimensions.width !== imageSpec.size ||
            dimensions.height !== imageSpec.size);

    function open(image: ProductImage | null) {
        form.setData({ image: null });
        form.clearErrors();
        setEditing({ image });
    }

    function submit() {
        if (!editing || !form.data.image) {
            return;
        }

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        };

        if (editing.image) {
            form.post(
                productImages.update({
                    product: productId,
                    image: editing.image.id,
                }).url,
                options,
            );
        } else {
            form.post(productImages.store(productId).url, options);
        }
    }

    function move(image: ProductImage, direction: 'up' | 'down') {
        router.post(
            productImages.move({ product: productId, image: image.id }).url,
            { direction },
            { preserveScroll: true },
        );
    }

    function remove(image: ProductImage) {
        if (confirm('Delete this image? This cannot be undone.')) {
            router.delete(
                productImages.destroy({ product: productId, image: image.id })
                    .url,
                { preserveScroll: true },
            );
        }
    }

    const isNew = editing?.image === null;

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                    <h3 className="text-lg font-semibold">Images</h3>
                    <p className="text-sm text-muted-foreground">
                        The photos in the storefront's product slideshow, in the
                        order shown. The first one is the featured image. Use{' '}
                        {imageSpec.size} x {imageSpec.size} px (square) WebP
                        files for the best result.
                    </p>
                </div>
                <Button type="button" onClick={() => open(null)}>
                    <ImagePlus />
                    Add image
                </Button>
            </div>

            {images.length === 0 ? (
                <p className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
                    No images yet, so the storefront shows no product photos.
                </p>
            ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {images.map((image, index) => (
                        <li
                            key={image.id}
                            className="flex flex-col overflow-hidden rounded-lg border bg-card"
                        >
                            <div className="relative aspect-square bg-muted">
                                <img
                                    src={image.image_url}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                                <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm">
                                    {index === 0 ? 'Featured' : `#${index + 1}`}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 p-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Move earlier"
                                    disabled={index === 0}
                                    onClick={() => move(image, 'up')}
                                >
                                    <ArrowLeft />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Move later"
                                    disabled={index === images.length - 1}
                                    onClick={() => move(image, 'down')}
                                >
                                    <ArrowRight />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-8"
                                    aria-label="Replace image"
                                    onClick={() => open(image)}
                                >
                                    <Replace />
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="ml-auto size-8"
                                    aria-label="Delete image"
                                    onClick={() => remove(image)}
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? 'Add image' : 'Replace image'}
                        </DialogTitle>
                        <DialogDescription>
                            Shown in the product slideshow on the storefront.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="product-image">Image</Label>
                        <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">
                                Image requirements
                            </p>
                            <ul className="mt-1 list-disc space-y-0.5 pl-4">
                                <li>
                                    Format:{' '}
                                    <strong className="text-foreground">
                                        WebP
                                    </strong>{' '}
                                    (.webp)
                                </li>
                                <li>
                                    Size:{' '}
                                    <strong className="text-foreground">
                                        {imageSpec.size} x {imageSpec.size}{' '}
                                        pixels
                                    </strong>{' '}
                                    (square)
                                </li>
                                <li>
                                    File size: up to{' '}
                                    <strong className="text-foreground">
                                        {imageSpec.max_kb / 1024} MB
                                    </strong>
                                </li>
                            </ul>
                        </div>
                        {(preview ?? editing?.image?.image_url) && (
                            <img
                                src={preview ?? editing?.image?.image_url}
                                alt=""
                                className="aspect-square w-40 rounded-lg border object-cover"
                            />
                        )}
                        <Input
                            id="product-image"
                            type="file"
                            accept="image/webp"
                            onChange={(e) =>
                                form.setData(
                                    'image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        {fileProblem && (
                            <p className="text-sm text-destructive">
                                {fileProblem}
                            </p>
                        )}
                        {needsConversion && dimensions && (
                            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                                This image is {dimensions.width} x{' '}
                                {dimensions.height} pixels, not {imageSpec.size}{' '}
                                x {imageSpec.size}. The server will convert it
                                automatically by cropping it to a centred square
                                and resizing it, but the edges may be cut off
                                and the image may not look its best. For the
                                best result, upload it at exactly{' '}
                                {imageSpec.size} x {imageSpec.size}.
                            </p>
                        )}
                        <InputError message={form.errors.image} />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditing(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={submit}
                            disabled={
                                form.processing ||
                                !form.data.image ||
                                fileProblem !== null
                            }
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
