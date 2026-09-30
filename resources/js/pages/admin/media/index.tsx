import { Head, router, useForm } from '@inertiajs/react';
import { Copy, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClipboard } from '@/hooks/use-clipboard';
import { dashboard } from '@/routes/admin';
import media from '@/routes/admin/media';
import type { Paginated } from '@/types';

type MediaItem = {
    id: number;
    url: string;
    filename: string;
    mime_type: string;
    size: number;
    created_at: string | null;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaIndex({
    media: paginated,
}: {
    media: Paginated<MediaItem>;
}) {
    const form = useForm<{ file: File | null }>({ file: null });
    const [, copy] = useClipboard();

    function upload(e: React.FormEvent) {
        e.preventDefault();

        if (!form.data.file) {
            return;
        }

        form.post(media.store().url, {
            forceFormData: true,
            onSuccess: () => form.reset(),
        });
    }

    function remove(item: MediaItem) {
        if (confirm(`Delete "${item.filename}"?`)) {
            router.delete(media.destroy(item.id).url, { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Media" />

            <Heading
                title="Media"
                description="Images and files used across the site."
            />

            <form
                onSubmit={upload}
                className="flex flex-wrap items-start gap-2"
            >
                <div>
                    <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                        onChange={(e) =>
                            form.setData('file', e.target.files?.[0] ?? null)
                        }
                        className="text-sm"
                    />
                    <InputError message={form.errors.file} />
                </div>
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.file}
                >
                    Upload
                </Button>
            </form>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {paginated.data.map((item) => (
                    <Card key={item.id} className="gap-2 py-2">
                        <CardContent className="px-2">
                            <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted">
                                {item.mime_type.startsWith('image/') ? (
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        {item.mime_type}
                                    </span>
                                )}
                            </div>
                            <p
                                className="truncate text-xs font-medium"
                                title={item.filename}
                            >
                                {item.filename}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {formatBytes(item.size)}
                            </p>
                            <div className="mt-2 flex gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => copy(item.url)}
                                    title="Copy URL"
                                >
                                    <Copy className="size-3.5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="size-7"
                                    onClick={() => remove(item)}
                                    title="Delete"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {paginated.data.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    No files uploaded yet.
                </p>
            )}

            <Pagination links={paginated.links} />
        </>
    );
}

MediaIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Media', href: media.index() },
    ],
};
