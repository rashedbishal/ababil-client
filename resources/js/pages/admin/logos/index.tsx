import { Head, router, useForm, usePage } from '@inertiajs/react';
import { RotateCcw, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import { dashboard } from '@/routes/admin';
import logosRoutes from '@/routes/admin/logos';
import defaultBrandMark from '../../../../images/landing/ababil-logo.webp';

type LogoKey = 'site' | 'admin' | 'favicon';

type LogoSlot = {
    key: LogoKey;
    label: string;
    description: string;
    size: number;
    formats: string[];
    recommended_format: string;
    image_url: string | null;
};

// What shows when nothing has been uploaded: the bundled brand mark, or for
// the favicon, the icon files shipped in public/.
const defaultImages: Record<LogoKey, string> = {
    site: defaultBrandMark,
    admin: defaultBrandMark,
    favicon: '/favicon-192x192.png',
};

export default function LogosIndex({
    slots,
    maxKb,
}: {
    slots: LogoSlot[];
    maxKb: number;
}) {
    const { name } = usePage().props;
    const [editing, setEditing] = useState<LogoSlot | null>(null);
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

    const file = form.data.image;
    const allowedMimes = editing
        ? editing.formats.map((format) =>
              format === 'JPG' || format === 'JPEG'
                  ? 'image/jpeg'
                  : `image/${format.toLowerCase()}`,
          )
        : [];

    // Format and file size are hard limits (the server rejects them); the
    // pixel size is only a warning, since the server converts the image.
    const fileProblem =
        !file || !editing
            ? null
            : !allowedMimes.includes(file.type)
              ? `This file type isn't accepted. Use ${editing.formats.join(', ')}.`
              : file.size > maxKb * 1024
                ? `This file is ${(file.size / 1024 / 1024).toFixed(2)} MB. The limit is ${maxKb / 1024} MB.`
                : null;

    function conversionNote(): string | null {
        if (!editing || !file || !dimensions || fileProblem) {
            return null;
        }

        const { width, height } = dimensions;
        const exactSize = width === editing.size && height === editing.size;

        if (editing.key === 'favicon') {
            return width !== height || Math.min(width, height) < 192
                ? `This image is ${width} x ${height} pixels. ${
                      width !== height
                          ? 'It is not square, so it will be centred on a transparent square, which makes the icon look smaller. '
                          : ''
                  }${
                      Math.min(width, height) < 192
                          ? 'It is also smaller than 192 pixels, so the larger icon sizes will be scaled up and look blurry. '
                          : ''
                  }For the best result, upload a square PNG of ${editing.size} x ${editing.size} pixels.`
                : null;
        }

        const isRecommendedFormat = file.type === 'image/webp';

        if (exactSize && isRecommendedFormat) {
            return null;
        }

        return `This image is ${width} x ${height} pixels${
            isRecommendedFormat ? '' : ` and is not a WebP file`
        }. The server will convert it automatically: it is scaled to fit inside a transparent ${editing.size} x ${editing.size} square and saved as WebP. Nothing is cropped, but the logo may end up smaller or slightly softer${
            file.type === 'image/jpeg'
                ? ', and a JPG has no transparent background, so it keeps its solid background'
                : ''
        }. For the best result, upload a ${editing.size} x ${editing.size} WebP.`;
    }

    function openUpload(logo: LogoSlot) {
        // Not form.reset(): Inertia's useForm re-bases its "defaults" to
        // whatever was last submitted successfully.
        form.setData({ image: null });
        form.clearErrors();
        setEditing(logo);
    }

    function submit() {
        if (!editing) {
            return;
        }

        form.post(logosRoutes.update({ slot: editing.key }).url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    function reset(logo: LogoSlot) {
        if (confirm(`Reset "${logo.label}" to the default?`)) {
            router.delete(logosRoutes.destroy({ slot: logo.key }).url, {
                preserveScroll: true,
            });
        }
    }

    const note = conversionNote();

    return (
        <>
            <Head title="Logo Management" />

            <Heading
                title="Logo Management"
                description="Change the site's logo and browser tab icon. Each one shows where it appears. Until you upload one, the built-in default is used."
            />

            <div className="grid gap-6">
                {slots.map((logo) => {
                    const current = logo.image_url ?? defaultImages[logo.key];

                    return (
                        <section
                            key={logo.key}
                            className="grid gap-4 rounded-xl border p-4 sm:p-5 md:grid-cols-[minmax(0,260px)_1fr]"
                        >
                            {/* Where it appears */}
                            <div className="grid content-start gap-2">
                                {logo.key === 'site' && (
                                    <div className="flex items-center gap-2 rounded-lg bg-stone-950 px-3 py-3">
                                        <img
                                            src={current}
                                            alt=""
                                            className="size-9"
                                        />
                                        <span className="font-bengali text-lg font-semibold text-amber-300">
                                            আবাবিল
                                        </span>
                                    </div>
                                )}
                                {logo.key === 'admin' && (
                                    <div className="flex items-center gap-2 rounded-lg border bg-sidebar px-3 py-3">
                                        <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg border border-border/50">
                                            <img
                                                src={current}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm font-semibold">
                                            {name}
                                        </span>
                                    </div>
                                )}
                                {logo.key === 'favicon' && (
                                    <div className="rounded-lg bg-muted px-3 pt-3">
                                        <div className="flex w-44 items-center gap-2 rounded-t-lg bg-background px-3 py-2 text-xs">
                                            <img
                                                src={current}
                                                alt=""
                                                className="size-4"
                                            />
                                            <span className="truncate">
                                                {name}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Preview of how it looks on the site.
                                </p>
                            </div>

                            <div className="grid content-start gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold">
                                        {logo.label}
                                    </h3>
                                    {logo.image_url ? (
                                        <Badge>Custom</Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Default
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {logo.description}
                                </p>

                                <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                                    <p className="font-medium text-foreground">
                                        File requirements
                                    </p>
                                    <ul className="mt-1 list-disc space-y-0.5 pl-4">
                                        <li>
                                            Format:{' '}
                                            <strong className="text-foreground">
                                                {logo.recommended_format}
                                            </strong>{' '}
                                            recommended (also accepted:{' '}
                                            {logo.formats
                                                .filter(
                                                    (format) =>
                                                        format !==
                                                        logo.recommended_format,
                                                )
                                                .join(', ')}
                                            )
                                        </li>
                                        <li>
                                            Size:{' '}
                                            <strong className="text-foreground">
                                                {logo.size} x {logo.size} pixels
                                            </strong>{' '}
                                            (square, transparent background
                                            works best)
                                        </li>
                                        <li>
                                            File size: up to{' '}
                                            <strong className="text-foreground">
                                                {maxKb / 1024} MB
                                            </strong>
                                        </li>
                                        {logo.key === 'favicon' && (
                                            <li>
                                                The 48, 192 and 180 pixel icons
                                                browsers need are generated from
                                                your upload.
                                            </li>
                                        )}
                                    </ul>
                                    <p className="mt-2">
                                        A file that doesn&rsquo;t match is
                                        converted by the server automatically,
                                        but the result may not look its best.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Button onClick={() => openUpload(logo)}>
                                        <Upload />
                                        {logo.image_url ? 'Replace' : 'Upload'}
                                    </Button>
                                    {logo.image_url && (
                                        <Button
                                            variant="outline"
                                            onClick={() => reset(logo)}
                                        >
                                            <RotateCcw />
                                            Reset to default
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </section>
                    );
                })}
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing?.image_url ? 'Replace' : 'Upload'}{' '}
                            {editing?.label.toLowerCase()}
                        </DialogTitle>
                        <DialogDescription>
                            {editing?.size} x {editing?.size} pixels,{' '}
                            {editing?.recommended_format}, up to {maxKb / 1024}{' '}
                            MB.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-3">
                        <Label htmlFor="logo-image">Image</Label>
                        {(preview ?? editing?.image_url) && (
                            <img
                                src={preview ?? editing?.image_url ?? ''}
                                alt=""
                                className="size-24 rounded-lg border bg-[repeating-conic-gradient(#e5e5e5_0%_25%,#fff_0%_50%)] bg-[length:12px_12px] object-contain"
                            />
                        )}
                        <Input
                            id="logo-image"
                            type="file"
                            accept={allowedMimes.join(',')}
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
                        {note && (
                            <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                                {note}
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
                                fileProblem !== null ||
                                !form.data.image
                            }
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

LogosIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Logo Management', href: logosRoutes.index() },
    ],
};
