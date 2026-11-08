import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    Eye,
    EyeOff,
    ImagePlus,
    Pencil,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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

type HeroBannerSlide = {
    id: number;
    alt: string;
    is_active: boolean;
    desktop_image_url: string;
    tab_image_url: string;
    mobile_image_url: string;
    missing_variants: string[];
};

type ImageSpec = {
    desktop: { width: number; height: number; max_kb: number };
    tab: { width: number; height: number; max_kb: number };
    mobile: { width: number; height: number; max_kb: number };
};

type FormValues = {
    alt: string;
    is_active: boolean;
    desktop_image: File | null;
    tab_image: File | null;
    mobile_image: File | null;
};

const emptyForm: FormValues = {
    alt: '',
    is_active: true,
    desktop_image: null,
    tab_image: null,
    mobile_image: null,
};

type Editing = { slide: HeroBannerSlide | null };

export default function HeroBannerIndex({
    slides,
    imageSpec,
    warning,
}: {
    slides: HeroBannerSlide[];
    imageSpec: ImageSpec;
    warning: string;
}) {
    const [editing, setEditing] = useState<Editing | null>(null);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const form = useForm<FormValues>(emptyForm);

    useEffect(() => {
        const next: Record<string, string> = {};

        for (const key of [
            'desktop_image',
            'tab_image',
            'mobile_image',
        ] as const) {
            const file = form.data[key];

            if (!file) {
                continue;
            }

            next[key] = URL.createObjectURL(file);
        }

        setPreviews(next);

        return () => {
            for (const url of Object.values(next)) {
                URL.revokeObjectURL(url);
            }
        };
    }, [form.data.desktop_image, form.data.tab_image, form.data.mobile_image]);

    function openCreate() {
        form.setData(emptyForm);
        form.clearErrors();
        setEditing({ slide: null });
    }

    function openEdit(slide: HeroBannerSlide) {
        form.setData({
            alt: slide.alt,
            is_active: slide.is_active,
            desktop_image: null,
            tab_image: null,
            mobile_image: null,
        });
        form.clearErrors();
        setEditing({ slide });
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

        if (editing.slide) {
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(`/admin/hero-banner/${editing.slide.id}`, options);
        } else {
            form.transform((data) => data);
            form.post('/admin/hero-banner', options);
        }
    }

    function toggleVisibility(slide: HeroBannerSlide) {
        router.patch(
            `/admin/hero-banner/${slide.id}/visibility`,
            { is_active: !slide.is_active },
            { preserveScroll: true },
        );
    }

    function move(slide: HeroBannerSlide, direction: 'up' | 'down') {
        router.post(
            `/admin/hero-banner/${slide.id}/move`,
            { direction },
            { preserveScroll: true },
        );
    }

    function remove(slide: HeroBannerSlide) {
        if (confirm('Delete this hero banner slide? This cannot be undone.')) {
            router.delete(`/admin/hero-banner/${slide.id}`, {
                preserveScroll: true,
            });
        }
    }

    function fileWarning(file: File | null, variant: keyof ImageSpec) {
        if (!file) {
            return null;
        }

        if (file.type !== 'image/webp') {
            return 'Only WebP uploads are supported.';
        }

        const limit = imageSpec[variant].max_kb * 1024;

        if (file.size > limit) {
            return `This file is ${(file.size / 1024).toFixed(1)} KB. The limit is ${imageSpec[variant].max_kb} KB.`;
        }

        return null;
    }

    return (
        <>
            <Head title="Hero Banner Management" />
            <Heading
                title="Hero Banner Management"
                description="Manage the hero banner images for desktop, tab and mobile breakpoints. Each slide should ideally have all three files uploaded for the best visual quality."
            />

            <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4 text-sm text-amber-900">
                <p className="font-medium">Upload guidance</p>
                <p className="mt-1">{warning}</p>
                <ul className="mt-2 space-y-1 text-xs text-amber-800">
                    <li>
                        Desktop: {imageSpec.desktop.width}×
                        {imageSpec.desktop.height}px, max{' '}
                        {imageSpec.desktop.max_kb} KB, WebP
                    </li>
                    <li>
                        Tablet: {imageSpec.tab.width}×{imageSpec.tab.height}px,
                        max {imageSpec.tab.max_kb} KB, WebP
                    </li>
                    <li>
                        Mobile: {imageSpec.mobile.width}×
                        {imageSpec.mobile.height}px, max{' '}
                        {imageSpec.mobile.max_kb} KB, WebP
                    </li>
                </ul>
            </div>

            <div className="mt-6 space-y-4">
                {slides.length === 0 ? (
                    <p className="rounded-lg border py-8 text-center text-sm text-muted-foreground">
                        No hero banner slides yet.
                    </p>
                ) : (
                    slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="rounded-xl border bg-card p-4 shadow-sm"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid gap-1 text-xs text-muted-foreground">
                                        <span>Slide #{index + 1}</span>
                                        {slide.missing_variants.length > 0 && (
                                            <span className="text-amber-700">
                                                Missing:{' '}
                                                {slide.missing_variants.join(
                                                    ', ',
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label="Move earlier"
                                        disabled={index === 0}
                                        onClick={() => move(slide, 'up')}
                                    >
                                        <ArrowUp className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label="Move later"
                                        disabled={index === slides.length - 1}
                                        onClick={() => move(slide, 'down')}
                                    >
                                        <ArrowDown className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label="Toggle visibility"
                                        onClick={() => toggleVisibility(slide)}
                                    >
                                        {slide.is_active ? (
                                            <Eye className="size-4" />
                                        ) : (
                                            <EyeOff className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label="Edit slide"
                                        onClick={() => openEdit(slide)}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        aria-label="Delete slide"
                                        onClick={() => remove(slide)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                {[
                                    ['desktop', slide.desktop_image_url],
                                    ['tab', slide.tab_image_url],
                                    ['mobile', slide.mobile_image_url],
                                ].map(([variant, url]) => (
                                    <div
                                        key={variant}
                                        className="rounded-lg border bg-muted/40 p-2"
                                    >
                                        <div className="mb-2 flex items-center justify-between text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            <span>{variant}</span>
                                        </div>
                                        {url ? (
                                            <img
                                                src={url}
                                                alt={slide.alt}
                                                className="aspect-[16/9] w-full rounded-md object-cover"
                                            />
                                        ) : (
                                            <div className="flex aspect-[16/9] w-full items-center justify-center rounded-md border border-dashed text-center text-xs text-muted-foreground">
                                                Not uploaded
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {slide.missing_variants.length > 0 && (
                                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    This slide is missing{' '}
                                    {slide.missing_variants.join(', ')}{' '}
                                    versions. The app will crop the available
                                    image to fill the missing breakpoint, which
                                    reduces visual quality.
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="button" onClick={openCreate}>
                    <ImagePlus />
                    Add slide
                </Button>
            </div>

            {editing && (
                <Dialog
                    open={true}
                    onOpenChange={(open) => !open && setEditing(null)}
                >
                    <DialogContent className="max-h-[90vh] overflow-y-auto md:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editing.slide ? 'Edit slide' : 'Add slide'}
                            </DialogTitle>
                            <DialogDescription>
                                Upload all three versions for the best hero
                                banner quality. If one version is missing, the
                                app will crop another version for that
                                breakpoint.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hero-alt">Alt text</Label>
                                <Input
                                    id="hero-alt"
                                    value={form.data.alt}
                                    onChange={(event) =>
                                        form.setData('alt', event.target.value)
                                    }
                                    placeholder="Describe the slide"
                                />
                                <InputError message={form.errors.alt} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="hero-active"
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_active',
                                                Boolean(checked),
                                            )
                                        }
                                    />
                                    <Label htmlFor="hero-active">
                                        Show on storefront
                                    </Label>
                                </div>
                            </div>

                            {(
                                [
                                    'desktop_image',
                                    'tab_image',
                                    'mobile_image',
                                ] as const
                            ).map((variant) => {
                                const variantKey = `${variant}` as const;
                                const variantName = variant.replace(
                                    '_image',
                                    '',
                                ) as 'desktop' | 'tab' | 'mobile';
                                const warningText = fileWarning(
                                    form.data[variantKey],
                                    variantName,
                                );
                                const previewUrl =
                                    previews[variant] ??
                                    (editing.slide
                                        ? variant === 'desktop_image'
                                            ? editing.slide.desktop_image_url
                                            : variant === 'tab_image'
                                              ? editing.slide.tab_image_url
                                              : editing.slide.mobile_image_url
                                        : undefined);

                                return (
                                    <div
                                        key={variant}
                                        className="space-y-2 rounded-lg border p-3"
                                    >
                                        <Label
                                            htmlFor={variant}
                                            className="font-medium"
                                        >
                                            {variantName
                                                .charAt(0)
                                                .toUpperCase() +
                                                variantName.slice(1)}{' '}
                                            version
                                        </Label>
                                        <Input
                                            id={variant}
                                            type="file"
                                            accept="image/webp"
                                            onChange={(event) => {
                                                const file =
                                                    event.target.files?.[0] ??
                                                    null;
                                                form.setData(variant, file);
                                            }}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {variant === 'desktop_image'
                                                ? 'Desktop (1600×900 px, max 100 KB)'
                                                : variant === 'tab_image'
                                                  ? 'Tablet (1024×1220 px, max 80 KB)'
                                                  : 'Mobile (768×1200 px, max 50 KB)'}
                                        </p>
                                        {warningText && (
                                            <p className="text-xs text-red-600">
                                                {warningText}
                                            </p>
                                        )}
                                        {previewUrl && (
                                            <img
                                                src={previewUrl}
                                                alt=""
                                                className="mt-2 aspect-[16/9] w-full rounded-md object-cover"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <DialogFooter className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="button" onClick={submit}>
                                {editing.slide ? 'Save changes' : 'Add slide'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
