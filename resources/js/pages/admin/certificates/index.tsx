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
import certificates from '@/routes/admin/certificates';

type CertificateItem = {
    id: number;
    image_url: string;
    title: string;
    subtitle: string | null;
    is_active: boolean;
};

type FormValues = {
    image: File | null;
    title: string;
    subtitle: string;
    is_active: boolean;
};

const emptyForm: FormValues = {
    image: null,
    title: '',
    subtitle: '',
    is_active: true,
};

const acceptedMimes = ['image/webp', 'image/png', 'image/jpeg'];

export default function CertificatesIndex({
    title,
    description,
    isVisible,
    items,
}: {
    title: string;
    description: string;
    isVisible: boolean;
    items: CertificateItem[];
}) {
    const [editing, setEditing] = useState<CertificateItem | 'new' | null>(
        null,
    );
    const [preview, setPreview] = useState<string | null>(null);
    const form = useForm<FormValues>(emptyForm);

    useEffect(() => {
        if (!form.data.image) {
            setPreview(null);
            return;
        }

        const url = URL.createObjectURL(form.data.image);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [form.data.image]);

    const file = form.data.image;
    const fileProblem = !file
        ? null
        : !acceptedMimes.includes(file.type)
          ? 'This file type is not accepted. Use WebP, PNG or JPG.'
          : file.size > 2048 * 1024
            ? `This file is ${(file.size / 1024 / 1024).toFixed(2)} MB. The limit is 2 MB.`
            : null;

    function openAdd() {
        form.setData(emptyForm);
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(item: CertificateItem) {
        form.setData({
            image: null,
            title: item.title,
            subtitle: item.subtitle ?? '',
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
            form.post(certificates.store().url, options);
        } else {
            form.transform((data) => ({ ...data, _method: 'patch' }));
            form.post(certificates.update(editing.id).url, options);
        }
    }

    function toggleVisibility(item: CertificateItem) {
        router.patch(
            certificates.visibility(item.id).url,
            { is_active: !item.is_active },
            { preserveScroll: true },
        );
    }

    function move(item: CertificateItem, direction: 'up' | 'down') {
        router.post(
            certificates.move(item.id).url,
            { direction },
            { preserveScroll: true },
        );
    }

    function remove(item: CertificateItem) {
        if (confirm('Delete this certificate? This cannot be undone.')) {
            router.delete(certificates.destroy(item.id).url, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Certificates" />

            <Heading
                title="Certificates"
                description="Manage the certificates shown in the storefront trust section."
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
                    </div>
                    <Button
                        onClick={openAdd}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <ImagePlus />
                        Add certificate
                    </Button>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No certificates added yet.
                        </p>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center"
                            >
                                <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="h-28 w-auto rounded-md border bg-white object-contain"
                                />
                                <div className="flex-1 space-y-1">
                                    <p className="font-semibold">
                                        {item.title}
                                    </p>
                                    {item.subtitle && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleVisibility(item)}
                                    >
                                        {item.is_active ? <Eye /> : <EyeOff />}
                                        {item.is_active ? 'Hide' : 'Show'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => move(item, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ArrowLeft className="size-4" />
                                        Up
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => move(item, 'down')}
                                        disabled={index === items.length - 1}
                                    >
                                        Down
                                        <ArrowRight className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(item)}
                                    >
                                        <Pencil />
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => remove(item)}
                                    >
                                        <Trash2 />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="max-h-[82vh] overflow-y-auto p-5 sm:max-w-lg sm:p-6">
                    <DialogHeader className="pr-8">
                        <DialogTitle>
                            {editing === 'new'
                                ? 'Add certificate'
                                : 'Edit certificate'}
                        </DialogTitle>
                        <DialogDescription>
                            Upload a certificate image and keep its
                            title/subtitle in sync with the storefront.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 overflow-y-auto py-2 pr-1">
                        <div className="grid gap-2">
                            <Label htmlFor="certificate-image">Image</Label>
                            <Input
                                id="certificate-image"
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={(event) =>
                                    form.setData(
                                        'image',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            {fileProblem && (
                                <p className="text-sm text-red-600">
                                    {fileProblem}
                                </p>
                            )}
                            {(preview ||
                                (editing &&
                                    editing !== 'new' &&
                                    editing.image_url)) && (
                                <img
                                    src={
                                        preview ??
                                        (editing && editing !== 'new'
                                            ? editing.image_url
                                            : undefined)
                                    }
                                    alt="Certificate preview"
                                    className="max-h-72 rounded-md border bg-white object-contain"
                                />
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="certificate-title">Title</Label>
                            <Input
                                id="certificate-title"
                                value={form.data.title}
                                onChange={(event) =>
                                    form.setData('title', event.target.value)
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="certificate-subtitle">
                                Subtitle
                            </Label>
                            <textarea
                                id="certificate-subtitle"
                                value={form.data.subtitle}
                                rows={3}
                                onChange={(event) =>
                                    form.setData('subtitle', event.target.value)
                                }
                                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="certificate-visible"
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', Boolean(checked))
                                }
                            />
                            <Label htmlFor="certificate-visible">
                                Show on storefront
                            </Label>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
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
                            disabled={form.processing || !!fileProblem}
                        >
                            {editing === 'new'
                                ? 'Add certificate'
                                : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
