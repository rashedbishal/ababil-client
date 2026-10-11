import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
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
    youtube_url: string;
    video_id: string;
    sort_order: number;
    is_active: boolean;
};

type FormValues = {
    youtube_url: string;
    is_active: boolean;
};

const emptyForm: FormValues = {
    youtube_url: '',
    is_active: true,
};

export default function ReviewsIndex({
    reviews: reviewList,
}: {
    reviews: Review[];
}) {
    const [editing, setEditing] = useState<Review | 'new' | null>(null);
    const form = useForm<FormValues>(emptyForm);

    function openCreate() {
        // Not form.reset(): Inertia's useForm re-bases its "defaults" to
        // whatever was last submitted successfully, so reset() would bring
        // back the previous review instead of a blank form.
        form.setData(emptyForm);
        form.clearErrors();
        setEditing('new');
    }

    function openEdit(review: Review) {
        form.setData({
            youtube_url: review.youtube_url,
            is_active: review.is_active,
        });
        form.clearErrors();
        setEditing(review);
    }

    function submit() {
        if (editing === 'new') {
            form.post(reviews.store().url, {
                preserveScroll: true,
                onSuccess: () => setEditing(null),
            });
        } else if (editing) {
            form.patch(reviews.update(editing.id).url, {
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

    return (
        <>
            <Head title="Review Management" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Heading
                    title="Review Management"
                    description="Manage the YouTube video reviews shown in the storefront's customer review carousel."
                />
                <Button onClick={openCreate} className="w-full sm:w-auto">
                    Add review
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Preview</TableHead>
                        <TableHead>YouTube URL</TableHead>
                        <TableHead>Sort order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reviewList.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="text-center text-muted-foreground"
                            >
                                No reviews yet.
                            </TableCell>
                        </TableRow>
                    )}
                    {reviewList.map((review) => (
                        <TableRow key={review.id}>
                            <TableCell>
                                <img
                                    src={`https://img.youtube.com/vi/${review.video_id}/mqdefault.jpg`}
                                    alt=""
                                    className="h-12 w-20 rounded object-cover"
                                />
                            </TableCell>
                            <TableCell className="max-w-xs truncate font-medium">
                                {review.youtube_url}
                            </TableCell>
                            <TableCell>{review.sort_order}</TableCell>
                            <TableCell>
                                {review.is_active ? (
                                    <Badge>Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

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
                        <div className="grid gap-2">
                            <Label htmlFor="review-youtube-url">
                                YouTube video URL
                            </Label>
                            <Input
                                id="review-youtube-url"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={form.data.youtube_url}
                                onChange={(e) =>
                                    form.setData('youtube_url', e.target.value)
                                }
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
