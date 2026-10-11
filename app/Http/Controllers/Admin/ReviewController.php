<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewRequest;
use App\Models\Review;
use App\Support\YouTube;
use Illuminate\Http\RedirectResponse;
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
                    'video_id' => $review->video_id,
                    'sort_order' => $review->sort_order,
                    'is_active' => $review->is_active,
                ]),
        ]);
    }

    public function store(ReviewRequest $request): RedirectResponse
    {
        Review::query()->create([
            ...$request->validated(),
            'video_id' => YouTube::extractVideoId($request->validated('youtube_url')),
            // New reviews are appended to the end of the carousel order -
            // admins never set this by hand.
            'sort_order' => (Review::query()->max('sort_order') ?? -1) + 1,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review added.']);

        return back();
    }

    public function update(ReviewRequest $request, Review $review): RedirectResponse
    {
        $review->update([
            ...$request->validated(),
            'video_id' => YouTube::extractVideoId($request->validated('youtube_url')),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review updated.']);

        return back();
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Review deleted.']);

        return back();
    }
}
