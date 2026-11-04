import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    EyeOff,
    ImagePlus,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import partners from '@/routes/admin/partners';

type Partner = {
    id: number;
    image_url: string;
    label: string;
    is_active: boolean;
};

type FormValues = {
    image: File | null;
    label: string;
    is_active: boolean;
};

const emptyForm: FormValues = { image: null, label: '', is_active: true };

const acceptedMimes = ['image/webp', 'image/png', 'image/jpeg'];

export default function PartnersIndex({
    title,
    description,
    isVisible,
    imageSpec,
    labelMaxLength,
    items,
}: {
    title: string;
    description: string;
    isVisible: boolean;
    imageSpec: { size: number; max_kb: number };
    labelMaxLength: number;
    items: Partner[];
}) {
    // `null` = dialog closed, 'new' = adding, otherwise the logo being edited.
    const [editing, setEditing] = useState<Partner | 'new' | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dimensions, setDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const form = useForm<FormValues>(emptyForm);

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
    // pixel size is only a warning, since the server converts the image.
    const file = form.data.image;
    const fileProblem = !file
        ? null
        : !acceptedMimes.includes(file.type)
          ? 'This file type is not accepted. Use WebP, PNG or JPG.'
          : file.size > imageSpec.max_kb * 1024
            ? `This file is ${(file.size / 1024 / 1024).toFixed(2)} MB. The limit is ${imageSpec.max_kb / 1024} MB.`
            : null;

    const conversionNote = (() => {
        if (!file || !dimensions || fileProblem) {
            return null;
        }

        const { width, height } = dimensions;
        const exact = width === imageSpec.size && height === imageSpec.size;
        const isWebp = file.type === 'image/webp';

        if (exact && isWebp) {
            return null;
        }

        return `This image is ${width} x ${height} pixels${
            isWebp ? '' : ' and is not a WebP file'
        }. The server will convert it automatically: it is scaled to fit inside a transparent ${imageSpec.size} x ${imageSpec.size} square and saved as WebP. Nothing is cropped, but the logo may end up smaller or slightly softer${
            file.type === 'image/jpeg'
                ? ', and a JPG has no transparent background, so it keeps its solid background'
                : ''
        }. For the best result, upload a ${imageSpec.size} x ${imageSpec.size} WebP.`;
    })();

    function openAdd() {
        // Not form.reset(): Inertia's useForm re-bases its "defaults" to
        // whatever was last submitted successfully.
        form.setData(emptyForm);
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(item: Partner) {
        form.setData({
            image: null,
            label: item.label,
            is_active: item.is_active,
        });
        form.clearErrors();
        setEditing(item);
    }

    function submit() {
        if (!editing) {
            return;
        }

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        };

        if (editing === 'new') {
            form.transform((data) => data);
            form.post(partners.store().url, options);
        } else {
            // PHP only parses multipart bodies on POST, so an update that may
            // carry a file is sent as a POST spoofing PATCH.
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(partners.update(editing.id).url, options);
        }
    }

    function toggleVisibility(item: Partner) {
        router.patch(
            partners.visibility(item.id).url,
            { is_active: !item.is_active },
            { preserveScroll: true },
        );
    }

    function move(item: Partner, direction: 'up' | 'down') {
        router.post(
            partners.move(item.id).url,
            { direction },
            { preserveScroll: true },
        );
    }

    function remove(item: Partner) {
        if (confirm('Delete this logo? This cannot be undone.')) {
            router.delete(partners.destroy(item.id).url, {
                preserveScroll: true,
            });
        }
    }

    const isNew = editing === 'new';

    return (
        <>
            <Head title="Partner Logos" />

            <Heading
                title="Partner Logos"
                description="Manage the certification and partner logos in the scrolling strip near the top of the storefront. Each logo comes with a short label under it. The section heading is fixed."
            />

            <section className="rounded-xl border">
                <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                    <div className="grid gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bengali text-xl font-semibold">
                                {title}
                            </h3>
                            {isVisible ? (
                                <Badge>Shown on storefront</Badge>
                            ) : (
                                <Badge variant="secondary">
                                    Hidden on storefront
                                </Badge>
                            )}
                        </div>
                        <p className="font-bengali text-sm text-muted-foreground">
                            {description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Dark strip directly below the banner. The logos
                            scroll sideways in a loop, in the order below.
                        </p>
                        {!isVisible && (
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                {items.length === 0
                                    ? 'No logos uploaded yet, so this whole section is left out of the storefront.'
                                    : 'Every logo is hidden, so this whole section is left out of the storefront.'}
                            </p>
                        )}
                    </div>
                    <Button
                        onClick={openAdd}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <ImagePlus />
                        Add logo
                    </Button>
                </div>

                <div className="p-4 sm:p-5">
                    {items.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No logos yet.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {items.map((item, index) => (
                                <li
                                    key={item.id}
                                    className="flex flex-col gap-3 rounded-lg border bg-card p-3"
                                >
                                    <div className="relative flex items-center justify-center rounded-lg bg-[#120e05] py-4">
                                        <div
                                            className={`flex size-28 items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-white p-3 ${
                                                item.is_active
                                                    ? ''
                                                    : 'opacity-40 grayscale'
                                            }`}
                                        >
                                            <img
                                                src={item.image_url}
                                                alt=""
                                                loading="lazy"
                                                className="size-full object-contain"
                                            />
                                        </div>
                                        <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm">
                                            #{index + 1}
                                        </span>
                                        {!item.is_active && (
                                            <Badge
                                                variant="secondary"
                                                className="absolute top-2 right-2"
                                            >
                                                Hidden
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm font-medium">
                                        {item.label}
                                    </p>
                                    <div className="mt-auto flex flex-wrap items-center gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                toggleVisibility(item)
                                            }
                                        >
                                            {item.is_active ? (
                                                <>
                                                    <EyeOff /> Hide
                                                </>
                                            ) : (
                                                <>
                                                    <Eye /> Show
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEdit(item)}
                                        >
                                            <Pencil /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            aria-label="Move earlier"
                                            disabled={index === 0}
                                            onClick={() => move(item, 'up')}
                                        >
                                            <ArrowLeft />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-8"
                                            aria-label="Move later"
                                            disabled={
                                                index === items.length - 1
                                            }
                                            onClick={() => move(item, 'down')}
                                        >
                                            <ArrowRight />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="ml-auto size-8"
                                            aria-label="Delete logo"
                                            onClick={() => remove(item)}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? 'Add logo' : 'Edit logo'}
                        </DialogTitle>
                        <DialogDescription>{title}</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="partner-image">
                                {isNew ? 'Logo' : 'Replace logo (optional)'}
                            </Label>
                            <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
                                <p className="font-medium text-foreground">
                                    Logo requirements
                                </p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                                    <li>
                                        Format:{' '}
                                        <strong className="text-foreground">
                                            WebP
                                        </strong>{' '}
                                        recommended (PNG and JPG also accepted)
                                    </li>
                                    <li>
                                        Size:{' '}
                                        <strong className="text-foreground">
                                            {imageSpec.size} x {imageSpec.size}{' '}
                                            pixels
                                        </strong>{' '}
                                        (square, transparent background works
                                        best)
                                    </li>
                                    <li>
                                        File size: up to{' '}
                                        <strong className="text-foreground">
                                            {imageSpec.max_kb / 1024} MB
                                        </strong>
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    A file that doesn&rsquo;t match is converted
                                    by the server automatically, but the result
                                    may not look its best.
                                </p>
                            </div>
                            {(preview ??
                                (editing !== 'new'
                                    ? editing?.image_url
                                    : null)) && (
                                <img
                                    src={
                                        preview ??
                                        (editing !== 'new'
                                            ? editing?.image_url
                                            : undefined)
                                    }
                                    alt=""
                                    className="size-24 rounded-lg border bg-white object-contain p-2"
                                />
                            )}
                            <Input
                                id="partner-image"
                                type="file"
                                accept={acceptedMimes.join(',')}
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
                            {conversionNote && (
                                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                                    {conversionNote}
                                </p>
                            )}
                            <InputError message={form.errors.image} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="partner-label">
                                Text under the logo
                            </Label>
                            <Input
                                id="partner-label"
                                maxLength={labelMaxLength}
                                value={form.data.label}
                                onChange={(e) =>
                                    form.setData('label', e.target.value)
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {form.data.label.length}/{labelMaxLength}{' '}
                                characters. Keep it short so it fits in 2 lines
                                on a phone.
                            </p>
                            <InputError message={form.errors.label} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="partner-active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked === true)
                                }
                            />
                            <Label htmlFor="partner-active">
                                Show this logo on the storefront
                            </Label>
                        </div>
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
                            disabled={form.processing || fileProblem !== null}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

PartnersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Partner Logos', href: partners.index() },
    ],
};
