<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewRequest;
use App\Models\Review;
use App\Support\YouTube;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/reviews/index', [
            'reviews' => Review::query()
                ->orderBy('sort_order')
                ->get()
                ->map(fn (Review $review) => [
                    'id' => $review->id,
                    'youtube_url' => $review->youtube_url,
                    'video_url' => $review->videoUrl(),
                    'thumbnail_url' => $review->thumbnailUrl(),
                    'video_id' => $review->video_id,
                    'sort_order' => $review->sort_order,
                    'is_active' => $review->is_active,
                ]),
        ]);
    }

    public function store(ReviewRequest $request): RedirectResponse
    {
        $attributes = $request->validated();

        $youtubeUrl = $attributes['youtube_url'] ?? null;
        $videoPath = $this->storeVideoFile($request, $attributes['video_file'] ?? null);
        $thumbnailFile = $attributes['thumbnail_file'] ?? null;
        $videoId = $youtubeUrl !== null && $youtubeUrl !== ''
            ? YouTube::extractVideoId($youtubeUrl)
            : null;

        Review::query()->create([
            'youtube_url' => $youtubeUrl,
            'video_id' => $videoId,
            'video_path' => $videoPath,
            'thumbnail_path' => $this->storeThumbnailFile($request, $videoPath, null, $thumbnailFile),
            'is_active' => $attributes['is_active'] ?? true,
            'sort_order' => (Review::query()->max('sort_order') ?? -1) + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review added.']);

        return back();
    }

    public function update(ReviewRequest $request, Review $review): RedirectResponse
    {
        $attributes = $request->validated();

        $clearVideo = (bool) ($attributes['clear_video'] ?? false);
        $clearYoutube = (bool) ($attributes['clear_youtube'] ?? false);
        $youtubeUrl = $attributes['youtube_url'] ?? null;
        $videoPath = $this->storeVideoFile($request, $attributes['video_file'] ?? null, $clearVideo ? null : $review->video_path);
        $thumbnailFile = $attributes['thumbnail_file'] ?? null;
        $videoId = $youtubeUrl !== null && $youtubeUrl !== ''
            ? YouTube::extractVideoId($youtubeUrl)
            : null;

        if ($clearVideo) {
            if (is_string($review->video_path) && $review->video_path !== '') {
                Storage::disk(Review::DISK)->delete($review->video_path);
            }

            if (is_string($review->thumbnail_path) && $review->thumbnail_path !== '') {
                Storage::disk(Review::DISK)->delete($review->thumbnail_path);
            }
        }

        if ($clearYoutube) {
            $youtubeUrl = null;
            $videoId = null;
        }

        $nextVideoPath = $clearVideo ? null : ($videoPath ?? $review->video_path);
        $nextThumbnailPath = $this->storeThumbnailFile(
            $request,
            $nextVideoPath,
            $clearVideo ? null : $review->thumbnail_path,
            $thumbnailFile,
        );

        $review->update([
            'youtube_url' => $youtubeUrl,
            'video_id' => $videoId,
            'video_path' => $nextVideoPath,
            'thumbnail_path' => $nextThumbnailPath,
            'is_active' => $attributes['is_active'] ?? $review->is_active,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review updated.']);

        return back();
    }

    public function reorder(Request $request): RedirectResponse
    {
        $order = array_values(array_filter(array_map('intval', $request->input('order', []))));

        foreach ($order as $index => $id) {
            Review::query()->whereKey($id)->update(['sort_order' => $index]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review order saved.']);

        return back();
    }

    public function destroy(Review $review): RedirectResponse
    {
        if (is_string($review->video_path) && $review->video_path !== '') {
            Storage::disk(Review::DISK)->delete($review->video_path);
        }

        if (is_string($review->thumbnail_path) && $review->thumbnail_path !== '') {
            Storage::disk(Review::DISK)->delete($review->thumbnail_path);
        }

        $review->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review deleted.']);

        return back();
    }

    private function storeVideoFile(Request $request, ?UploadedFile $file, ?string $previousPath = null): ?string
    {
        if (! $file || ! $file->isValid()) {
            return $previousPath;
        }

        if (is_string($previousPath) && $previousPath !== '') {
            Storage::disk(Review::DISK)->delete($previousPath);
        }

        $name = 'reviews/'.uniqid('review-', true).'.'.$file->getClientOriginalExtension();

        return $file->storeAs('reviews', basename($name), 'public') ?: null;
    }

    private function storeThumbnailFile(
        Request $request,
        ?string $videoPath,
        ?string $previousPath = null,
        ?UploadedFile $thumbnailFile = null,
    ): ?string {
        if ($thumbnailFile && $thumbnailFile->isValid()) {
            if (is_string($previousPath) && $previousPath !== '') {
                Storage::disk(Review::DISK)->delete($previousPath);
            }

            $name = 'reviews/thumbs/'.uniqid('review-thumb-', true).'.'.$thumbnailFile->getClientOriginalExtension();

            return $thumbnailFile->storeAs('reviews/thumbs', basename($name), 'public') ?: null;
        }

        if (! is_string($videoPath) || $videoPath === '') {
            return $previousPath;
        }

        if (is_string($previousPath) && $previousPath !== '') {
            Storage::disk(Review::DISK)->delete($previousPath);
        }

        return $previousPath;
    }
}
