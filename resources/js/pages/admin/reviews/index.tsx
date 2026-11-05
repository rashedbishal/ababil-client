import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes/admin';
import reviews from '@/routes/admin/reviews';

type Review = {
    id: number;
    youtube_url?: string | null;
    video_url?: string | null;
    thumbnail_url?: string | null;
    video_id?: string | null;
    sort_order: number;
    is_active: boolean;
};

type FormValues = {
    youtube_url: string;
    video_file: File | null;
    thumbnail_file: File | null;
    clear_video: boolean;
    clear_youtube: boolean;
    is_active: boolean;
};

const emptyForm: FormValues = {
    youtube_url: '',
    video_file: null,
    thumbnail_file: null,
    clear_video: false,
    clear_youtube: false,
    is_active: true,
};

export default function ReviewsIndex({
    reviews: reviewList,
}: {
    reviews: Review[];
}) {
    const [editing, setEditing] = useState<Review | 'new' | null>(null);
    const [reorderMode, setReorderMode] = useState(false);
    const [draftReviews, setDraftReviews] = useState<Review[]>(reviewList);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [existingVideoRemoved, setExistingVideoRemoved] = useState(false);
    const [existingYoutubeRemoved, setExistingYoutubeRemoved] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const form = useForm<FormValues>(emptyForm);
    const editingReview =
        editing !== null && editing !== 'new' ? editing : null;

    function renderReviewPreview(review: Review) {
        if (review.thumbnail_url) {
            return (
                <img
                    src={review.thumbnail_url}
                    alt="Review thumbnail"
                    className="h-12 w-20 rounded object-cover"
                />
            );
        }

        if (review.video_url) {
            return (
                <video
                    src={review.video_url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-12 w-20 rounded bg-stone-950 object-cover"
                />
            );
        }

        if (review.video_id) {
            return (
                <img
                    src={`https://i.ytimg.com/vi/${review.video_id}/mqdefault.jpg`}
                    alt="YouTube thumbnail"
                    className="h-12 w-20 rounded object-cover"
                />
            );
        }

        return (
            <div className="flex h-12 w-20 items-center justify-center rounded border border-dashed border-border bg-muted text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Video
            </div>
        );
    }

    useEffect(() => {
        setDraftReviews(reviewList);
    }, [reviewList]);

    async function createThumbnailFromVideo(
        file: File | null,
    ): Promise<File | null> {
        if (!file) {
            return null;
        }

        const objectUrl = URL.createObjectURL(file);

        try {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;

            await new Promise<void>((resolve, reject) => {
                const cleanup = () => {
                    video.onloadeddata = null;
                    video.onerror = null;
                };

                video.onloadeddata = () => {
                    cleanup();
                    resolve();
                };
                video.onerror = () => {
                    cleanup();
                    reject(
                        new Error(
                            'Video could not be loaded for thumbnail generation.',
                        ),
                    );
                };

                video.src = objectUrl;
            });

            video.currentTime = Math.min(0.5, video.duration || 0.5);

            await new Promise<void>((resolve, reject) => {
                const cleanup = () => {
                    video.onseeked = null;
                    video.onerror = null;
                };

                video.onseeked = () => {
                    cleanup();
                    resolve();
                };
                video.onerror = () => {
                    cleanup();
                    reject(new Error('Video frame could not be captured.'));
                };
            });

            const canvas = document.createElement('canvas');
            const width = video.videoWidth || 720;
            const height = video.videoHeight || 1280;
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d');

            if (!context) {
                return null;
            }

            context.drawImage(video, 0, 0, width, height);
            const blob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, 'image/jpeg', 0.9),
            );

            if (!blob) {
                return null;
            }

            return new File(
                [blob],
                `${file.name.replace(/\.[^.]+$/, '')}.jpg`,
                {
                    type: 'image/jpeg',
                },
            );
        } finally {
            URL.revokeObjectURL(objectUrl);
        }
    }

    const currentExistingVideoUrl =
        editingReview && !existingVideoRemoved
            ? (editingReview.video_url ?? null)
            : null;
    const currentExistingYoutubeUrl =
        editingReview && !existingYoutubeRemoved
            ? (editingReview.youtube_url ?? null)
            : null;
    const hasVideoSource = !!form.data.video_file || !!currentExistingVideoUrl;
    const hasYoutubeSource =
        form.data.youtube_url.trim().length > 0 || !!currentExistingYoutubeUrl;

    function clearSelectedVideo() {
        form.setData('video_file', null);
        form.setData('thumbnail_file', null);
        form.setData('clear_video', true);
        setFileInputKey((key) => key + 1);
        setExistingVideoRemoved(true);
    }

    function clearSelectedYoutubeUrl() {
        form.setData('youtube_url', '');
        form.setData('clear_youtube', true);
        setExistingYoutubeRemoved(true);
    }

    function openCreate() {
        form.setData({
            ...emptyForm,
            video_file: null,
            thumbnail_file: null,
            clear_video: false,
            clear_youtube: false,
        });
        setExistingVideoRemoved(false);
        setExistingYoutubeRemoved(false);
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(review: Review) {
        form.setData({
            youtube_url: review.youtube_url ?? '',
            video_file: null,
            thumbnail_file: null,
            clear_video: false,
            clear_youtube: false,
            is_active: review.is_active,
        });
        setExistingVideoRemoved(false);
        setExistingYoutubeRemoved(false);
        form.clearErrors();
        setEditing(review);
    }

    async function submit() {
        const selectedFile = form.data.video_file;

        let thumbnailFile = form.data.thumbnail_file;

        if (selectedFile && !thumbnailFile) {
            thumbnailFile = await createThumbnailFromVideo(selectedFile);
        }

        const nextYoutubeUrl = form.data.clear_youtube
            ? ''
            : form.data.youtube_url.trim();
        const hasYoutube = nextYoutubeUrl.length > 0;
        const nextVideoFile =
            hasYoutube || form.data.clear_video ? null : selectedFile;
        const nextThumbnailFile =
            hasYoutube || form.data.clear_video ? null : thumbnailFile;

        // PHP doesn't parse multipart bodies on PATCH, so edits are POSTed
        // with Laravel's _method spoofing.
        form.transform((data) => ({
            ...data,
            ...(editing === 'new' ? {} : { _method: 'patch' }),
            youtube_url: nextYoutubeUrl,
            video_file: nextVideoFile,
            thumbnail_file: nextThumbnailFile,
        }));

        if (editing === 'new') {
            form.post(reviews.store().url, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.post(reviews.update(editing.id).url, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        }
    }

    function remove(review: Review) {
        if (confirm('Delete this video review?')) {
            router.delete(reviews.destroy(review.id).url, {
                preserveScroll: true,
            });
        }
    }

    function handleReorderDrop(targetId: number) {
        if (draggedId === null || draggedId === targetId) {
            return;
        }

        setDraftReviews((current) => {
            const next = [...current];
            const dragIndex = next.findIndex((item) => item.id === draggedId);
            const targetIndex = next.findIndex((item) => item.id === targetId);

            if (dragIndex === -1 || targetIndex === -1) {
                return current;
            }

            const [moved] = next.splice(dragIndex, 1);
            next.splice(targetIndex, 0, moved);

            return next;
        });
        setDraggedId(null);
    }

    function saveReorder() {
        const order = draftReviews.map((item) => item.id);

        router.post(
            '/admin/reviews/reorder',
            { order },
            {
                preserveScroll: true,
                onSuccess: () => setReorderMode(false),
            },
        );
    }

    function cancelReorder() {
        setDraftReviews(reviewList);
        setReorderMode(false);
        setDraggedId(null);
    }

    const activeReviews = reorderMode ? draftReviews : reviewList;

    return (
        <>
            <Head title="Review Management" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Review Management"
                    description="Upload hosted short-form videos, keep the layout fixed, and drag reviews into the order you want shown on the storefront."
                />
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                        type="button"
                        variant={reorderMode ? 'secondary' : 'outline'}
                        onClick={() => {
                            if (reorderMode) {
                                cancelReorder();
                                return;
                            }

                            setReorderMode(true);
                            setDraftReviews(reviewList);
                        }}
                    >
                        {reorderMode ? 'Cancel reorder' : 'Reorder videos'}
                    </Button>
                    <Button onClick={openCreate} className="w-full sm:w-auto">
                        Add review
                    </Button>
                </div>
            </div>

            {reorderMode && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-100">
                    <span>
                        Drag reviews to reorder, then confirm the new order.
                    </span>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={cancelReorder}
                        >
                            Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={saveReorder}>
                            Confirm order
                        </Button>
                    </div>
                </div>
            )}

            {activeReviews.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    No reviews yet.
                </p>
            )}

            {/* Mobile: card list */}
            <div className="grid gap-3 md:hidden">
                {activeReviews.map((review) => (
                    <div
                        key={review.id}
                        className={`rounded-lg border p-4 ${reorderMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                        draggable={reorderMode}
                        onDragStart={() => setDraggedId(review.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleReorderDrop(review.id)}
                    >
                        <div className="flex items-start justify-between gap-3">
                            {renderReviewPreview(review)}
                            {review.is_active ? (
                                <Badge>Active</Badge>
                            ) : (
                                <Badge variant="secondary">Inactive</Badge>
                            )}
                        </div>
                        <p className="mt-3 truncate text-sm font-medium">
                            {review.youtube_url ?? 'Hosted video'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Sort order: {review.sort_order}
                        </p>
                        {!reorderMode && (
                            <div className="mt-3 flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEdit(review)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => remove(review)}
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Preview</TableHead>
                            <TableHead>Video</TableHead>
                            <TableHead>Sort order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                                {reorderMode ? 'Reorder' : 'Actions'}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeReviews.map((review) => (
                            <TableRow
                                key={review.id}
                                draggable={reorderMode}
                                onDragStart={() => setDraggedId(review.id)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={() => handleReorderDrop(review.id)}
                            >
                                <TableCell>
                                    {renderReviewPreview(review)}
                                </TableCell>
                                <TableCell className="max-w-xs truncate font-medium">
                                    {review.youtube_url ?? 'Hosted MP4 / MOV'}
                                </TableCell>
                                <TableCell>{review.sort_order}</TableCell>
                                <TableCell>
                                    {review.is_active ? (
                                        <Badge>Active</Badge>
                                    ) : (
                                        <Badge variant="secondary">
                                            Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {!reorderMode ? (
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEdit(review)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => remove(review)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Drag here
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editing === 'new' ? 'Add review' : 'Edit review'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4">
                        {editingReview &&
                            !existingVideoRemoved &&
                            (editingReview.video_url ||
                                editingReview.thumbnail_url) && (
                                <div className="grid gap-2">
                                    <Label>Current video</Label>
                                    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-2">
                                        {renderReviewPreview(editingReview)}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {editingReview.video_url
                                                    ? 'Existing hosted video'
                                                    : 'Existing thumbnail'}
                                            </p>
                                            {editingReview.video_url && (
                                                <a
                                                    href={
                                                        editingReview.video_url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="truncate text-xs text-muted-foreground underline-offset-2 hover:underline"
                                                >
                                                    Open current video
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="review-video-file">
                                    Hosted video file
                                </Label>
                                {(form.data.video_file ||
                                    !!currentExistingVideoUrl) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelectedVideo}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <Input
                                key={`${editingReview ? `edit-${editingReview.id}` : 'create-review-video'}-${fileInputKey}`}
                                id="review-video-file"
                                type="file"
                                accept=".mp4,.mov,video/mp4,video/quicktime"
                                disabled={hasYoutubeSource}
                                onChange={async (event) => {
                                    const selected =
                                        event.target.files?.[0] ?? null;
                                    form.setData('video_file', selected);
                                    form.setData('clear_video', false);
                                    setExistingVideoRemoved(false);

                                    if (selected) {
                                        form.setData('youtube_url', '');
                                        form.setData('clear_youtube', false);
                                        const generatedThumbnail =
                                            await createThumbnailFromVideo(
                                                selected,
                                            );
                                        form.setData(
                                            'thumbnail_file',
                                            generatedThumbnail,
                                        );
                                        return;
                                    }

                                    form.setData('thumbnail_file', null);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                MP4 or MOV only • max 50MB • recommended 9:16,
                                1080×1920
                            </p>
                            <InputError message={form.errors.video_file} />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label htmlFor="review-youtube-url">
                                    YouTube URL (legacy)
                                </Label>
                                {(form.data.youtube_url.trim().length > 0 ||
                                    !!currentExistingYoutubeUrl) && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSelectedYoutubeUrl}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <Input
                                id="review-youtube-url"
                                placeholder="Optional legacy YouTube link"
                                value={form.data.youtube_url}
                                disabled={hasVideoSource}
                                onChange={(e) => {
                                    const nextValue = e.target.value;
                                    form.setData('youtube_url', nextValue);
                                    form.setData('clear_youtube', false);
                                    setExistingYoutubeRemoved(false);

                                    if (nextValue.trim().length > 0) {
                                        form.setData('video_file', null);
                                        form.setData('thumbnail_file', null);
                                    }
                                }}
                            />
                            <InputError message={form.errors.youtube_url} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="review-status">Status</Label>
                            <Select
                                value={form.data.is_active ? '1' : '0'}
                                onValueChange={(value) =>
                                    form.setData('is_active', value === '1')
                                }
                            >
                                <SelectTrigger
                                    id="review-status"
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
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

ReviewsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Review Management', href: reviews.index() },
    ],
};
