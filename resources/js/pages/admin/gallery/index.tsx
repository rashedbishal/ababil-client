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
import gallery from '@/routes/admin/gallery';
import galleryItems from '@/routes/admin/gallery/items';

type GalleryPhoto = {
    id: number;
    image_url: string;
    caption: string;
    is_active: boolean;
};

type GallerySection = {
    key: string;
    title: string;
    description: string;
    placement: string;
    has_order_button: boolean;
    is_visible: boolean;
    items: GalleryPhoto[];
};

type FormValues = {
    image: File | null;
    caption: string;
    is_active: boolean;
};

const emptyForm: FormValues = { image: null, caption: '', is_active: true };

type Editing = { section: GallerySection; photo: GalleryPhoto | null };

export default function GalleryIndex({
    sections,
}: {
    sections: GallerySection[];
}) {
    const [editing, setEditing] = useState<Editing | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const form = useForm<FormValues>(emptyForm);

    // A local preview of the file picked in the dialog, released when it's
    // replaced or the dialog closes.
    useEffect(() => {
        if (!form.data.image) {
            setPreview(null);

            return;
        }

        const url = URL.createObjectURL(form.data.image);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.image]);

    function openAdd(section: GallerySection) {
        // Not form.reset(): Inertia's useForm re-bases its "defaults" to
        // whatever was last submitted successfully, so reset() would bring
        // back the previous photo's values instead of a blank form.
        form.setData(emptyForm);
        form.clearErrors();
        setEditing({ section, photo: null });
    }

    function openEdit(section: GallerySection, photo: GalleryPhoto) {
        form.setData({
            image: null,
            caption: photo.caption,
            is_active: photo.is_active,
        });
        form.clearErrors();
        setEditing({ section, photo });
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

        if (editing.photo) {
            // PHP only parses multipart bodies on POST, so the file upload
            // for an update is sent as a POST spoofing PATCH.
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(galleryItems.update(editing.photo.id).url, options);
        } else {
            form.transform((data) => data);
            form.post(
                galleryItems.store({ section: editing.section.key }).url,
                options,
            );
        }
    }

    function toggleVisibility(photo: GalleryPhoto) {
        router.patch(
            galleryItems.visibility(photo.id).url,
            { is_active: !photo.is_active },
            { preserveScroll: true },
        );
    }

    function move(photo: GalleryPhoto, direction: 'up' | 'down') {
        router.post(
            galleryItems.move(photo.id).url,
            { direction },
            { preserveScroll: true },
        );
    }

    function remove(photo: GalleryPhoto) {
        if (confirm('Delete this photo? This cannot be undone.')) {
            router.delete(galleryItems.destroy(photo.id).url, {
                preserveScroll: true,
            });
        }
    }

    const isNew = editing?.photo === null;

    return (
        <>
            <Head title="Gallery Management" />

            <Heading
                title="Gallery Management"
                description="Manage the photos in the three gallery sections of the storefront. Each photo comes with a short caption underneath it. The section headings are fixed."
            />

            <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                    <a
                        key={section.key}
                        href={`#gallery-${section.key}`}
                        className="rounded-full border px-3 py-1 font-bengali text-sm hover:bg-accent"
                    >
                        {section.title}
                    </a>
                ))}
            </div>

            <div className="mt-6 grid gap-8">
                {sections.map((section) => (
                    <section
                        key={section.key}
                        id={`gallery-${section.key}`}
                        className="scroll-mt-20 rounded-xl border"
                    >
                        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                            <div className="grid gap-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-bengali text-xl font-semibold">
                                        {section.title}
                                    </h3>
                                    {section.is_visible ? (
                                        <Badge>Shown on storefront</Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Hidden on storefront
                                        </Badge>
                                    )}
                                </div>
                                <p className="font-bengali text-sm text-muted-foreground">
                                    {section.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {section.placement}
                                </p>
                                {!section.is_visible && (
                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                        {section.items.length === 0
                                            ? 'No photos uploaded yet, so this whole section is left out of the storefront.'
                                            : 'Every photo is hidden, so this whole section is left out of the storefront.'}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={() => openAdd(section)}
                                className="w-full shrink-0 sm:w-auto"
                            >
                                <ImagePlus />
                                Add photo
                            </Button>
                        </div>

                        <div className="p-4 sm:p-5">
                            {section.items.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No photos in this section yet.
                                </p>
                            ) : (
                                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                    {section.items.map((photo, index) => (
                                        <li
                                            key={photo.id}
                                            className="flex flex-col overflow-hidden rounded-lg border bg-card"
                                        >
                                            <div className="relative aspect-square bg-muted">
                                                <img
                                                    src={photo.image_url}
                                                    alt=""
                                                    loading="lazy"
                                                    className={`size-full object-cover ${
                                                        photo.is_active
                                                            ? ''
                                                            : 'opacity-40 grayscale'
                                                    }`}
                                                />
                                                <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium shadow-sm">
                                                    #{index + 1}
                                                </span>
                                                {!photo.is_active && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="absolute top-2 right-2"
                                                    >
                                                        Hidden
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-3 p-3">
                                                <p className="font-bengali text-sm">
                                                    {photo.caption}
                                                    {section.has_order_button && (
                                                        <span className="ml-2 inline-block rounded-full bg-amber-400 px-2 py-0.5 align-middle text-[10px] font-bold whitespace-nowrap text-stone-950">
                                                            অর্ডার করুন →
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleVisibility(
                                                                photo,
                                                            )
                                                        }
                                                    >
                                                        {photo.is_active ? (
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
                                                        onClick={() =>
                                                            openEdit(
                                                                section,
                                                                photo,
                                                            )
                                                        }
                                                    >
                                                        <Pencil /> Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8"
                                                        aria-label="Move earlier"
                                                        disabled={index === 0}
                                                        onClick={() =>
                                                            move(photo, 'up')
                                                        }
                                                    >
                                                        <ArrowUp />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="size-8"
                                                        aria-label="Move later"
                                                        disabled={
                                                            index ===
                                                            section.items
                                                                .length -
                                                                1
                                                        }
                                                        onClick={() =>
                                                            move(photo, 'down')
                                                        }
                                                    >
                                                        <ArrowDown />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="ml-auto size-8"
                                                        aria-label="Delete photo"
                                                        onClick={() =>
                                                            remove(photo)
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                ))}
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isNew ? 'Add photo' : 'Edit photo'}
                        </DialogTitle>
                        <DialogDescription className="font-bengali">
                            {editing?.section.title}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="gallery-image">
                                {isNew ? 'Photo' : 'Replace photo (optional)'}
                            </Label>
                            {(preview ?? editing?.photo?.image_url) && (
                                <img
                                    src={preview ?? editing?.photo?.image_url}
                                    alt=""
                                    className="aspect-square w-40 rounded-lg border object-cover"
                                />
                            )}
                            <Input
                                id="gallery-image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) =>
                                    form.setData(
                                        'image',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                JPG, PNG or WebP, up to 5 MB. It is shown as a
                                square on the storefront, so a square photo
                                works best. It is resized and optimised
                                automatically.
                            </p>
                            <InputError message={form.errors.image} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="gallery-caption">
                                Text under the photo
                            </Label>
                            <Input
                                id="gallery-caption"
                                className="font-bengali"
                                maxLength={120}
                                value={form.data.caption}
                                onChange={(e) =>
                                    form.setData('caption', e.target.value)
                                }
                            />
                            <InputError message={form.errors.caption} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="gallery-active"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked === true)
                                }
                            />
                            <Label htmlFor="gallery-active">
                                Show this photo on the storefront
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
                            disabled={form.processing}
                        >
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

GalleryIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Gallery Management', href: gallery.index() },
    ],
};
