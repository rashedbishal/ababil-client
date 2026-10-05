import { Head, router, useForm } from '@inertiajs/react';
import { Copy, FileUp, Loader2, Trash2, UploadCloud, X } from 'lucide-react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClipboard } from '@/hooks/use-clipboard';
import { dashboard } from '@/routes/admin';
import type { Paginated } from '@/types';

const MEDIA_INDEX_URL = '/admin/media';

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    function upload(e: React.FormEvent) {
        e.preventDefault();

        if (!form.data.file) {
            return;
        }

        form.post(MEDIA_INDEX_URL, {
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    }

    function remove(item: MediaItem) {
        if (confirm(`Delete "${item.filename}"?`)) {
            router.delete(`${MEDIA_INDEX_URL}/${item.id}`, {
                preserveScroll: true,
            });
        }
    }

    return (
        <>
            <Head title="Media" />

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Media Library"
                    description="Upload and manage images and files used across the site."
                />
            </div>

            {/* Upload Area Card */}
            <Card className="border-dashed border-border/80 bg-card/60 backdrop-blur-xs">
                <CardContent className="p-6">
                    <form
                        onSubmit={upload}
                        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex flex-wrap items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                                onChange={(e) =>
                                    form.setData(
                                        'file',
                                        e.target.files?.[0] ?? null,
                                    )
                                }
                                className="hidden"
                                id="media-file-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                className="h-10 gap-2 border-border/80 text-sm font-medium hover:bg-accent"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="size-4 text-primary" />
                                Choose File
                            </Button>

                            {form.data.file ? (
                                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-xs">
                                    <FileUp className="size-3.5 text-primary" />
                                    <span className="max-w-[200px] truncate font-medium">
                                        {form.data.file.name}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="text-[10px]"
                                    >
                                        {formatBytes(form.data.file.size)}
                                    </Badge>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            form.setData('file', null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    PNG, JPG, WEBP, GIF, PDF (Max 10MB)
                                </span>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={form.processing || !form.data.file}
                            className="h-10 gap-2 font-medium"
                        >
                            {form.processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <FileUp className="size-4" />
                            )}
                            Upload File
                        </Button>
                    </form>
                    <InputError message={form.errors.file} className="mt-2" />
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {paginated.data.map((item) => (
                    <Card
                        key={item.id}
                        className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md"
                    >
                        <CardContent className="p-3">
                            <div className="relative mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/50">
                                {item.mime_type.startsWith('image/') ? (
                                    <img
                                        src={item.url}
                                        alt={item.filename}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        {item.mime_type.split('/')[1] ??
                                            item.mime_type}
                                    </span>
                                )}
                            </div>
                            <p
                                className="truncate text-xs font-semibold text-foreground"
                                title={item.filename}
                            >
                                {item.filename}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                {formatBytes(item.size)}
                            </p>
                            <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-border/40 pt-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => copy(item.url)}
                                    title="Copy URL"
                                >
                                    <Copy className="mr-1 size-3" />
                                    Copy URL
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                                    onClick={() => remove(item)}
                                    title="Delete file"
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {paginated.data.length === 0 && (
                <Card className="p-12 text-center text-muted-foreground">
                    <UploadCloud className="mx-auto mb-2 size-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium">
                        No files uploaded yet.
                    </p>
                    <p className="text-xs">
                        Select a file above to upload your first image or media
                        asset.
                    </p>
                </Card>
            )}

            <Pagination links={paginated.links} />
        </>
    );
}

MediaIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Media', href: MEDIA_INDEX_URL },
    ],
};
