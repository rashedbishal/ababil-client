<?php

use App\Models\Review;
use App\Models\User;

test('an admin can create a review from a youtube watch url', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.reviews.store'), [
        'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    $review = Review::query()->where('video_id', 'dQw4w9WgXcQ')->first();
    expect($review)->not->toBeNull()
        ->and($review->youtube_url)->toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
});

test('a new review is appended after the highest existing sort order', function () {
    $this->actingAsAdmin();
    Review::factory()->create(['sort_order' => 0]);
    Review::factory()->create(['sort_order' => 5]);

    $this->post(route('admin.reviews.store'), [
        'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ]);

    $review = Review::query()->where('video_id', 'dQw4w9WgXcQ')->first();
    expect($review->sort_order)->toBe(6);
});

test('the first review ever created gets sort order zero', function () {
    $this->actingAsAdmin();

    $this->post(route('admin.reviews.store'), [
        'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ]);

    $review = Review::query()->where('video_id', 'dQw4w9WgXcQ')->first();
    expect($review->sort_order)->toBe(0);
});

test('an admin can create a review from a youtu.be short url', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.reviews.store'), [
        'youtube_url' => 'https://youtu.be/L_LUpnjgPso',
    ]);

    $response->assertRedirect();
    expect(Review::query()->where('video_id', 'L_LUpnjgPso')->exists())->toBeTrue();
});

test('an admin can update a review', function () {
    $this->actingAsAdmin();
    $review = Review::factory()->create([
        'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'video_id' => 'dQw4w9WgXcQ',
    ]);

    $response = $this->put(route('admin.reviews.update', $review), [
        'youtube_url' => 'https://www.youtube.com/watch?v=tgbNymZ7vqY',
        'is_active' => true,
    ]);

    $response->assertRedirect();
    expect($review->fresh()->video_id)->toBe('tgbNymZ7vqY');
});

test('updating a review does not change its sort order', function () {
    $this->actingAsAdmin();
    $review = Review::factory()->create(['sort_order' => 3]);

    $this->put(route('admin.reviews.update', $review), [
        'youtube_url' => 'https://www.youtube.com/watch?v=tgbNymZ7vqY',
        'is_active' => true,
    ]);

    expect($review->fresh()->sort_order)->toBe(3);
});

test('an admin can delete a review', function () {
    $this->actingAsAdmin();
    $review = Review::factory()->create();

    $response = $this->delete(route('admin.reviews.destroy', $review));

    $response->assertRedirect();
    expect(Review::query()->find($review->id))->toBeNull();
});

test('a non-youtube url is rejected', function () {
    $this->actingAsAdmin();

    $response = $this->post(route('admin.reviews.store'), [
        'youtube_url' => 'https://example.com/not-a-video',
    ]);

    $response->assertSessionHasErrors('youtube_url');
    expect(Review::query()->count())->toBe(0);
});

test('a non-admin cannot manage reviews', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)->get(route('admin.reviews.index'))->assertForbidden();
});
