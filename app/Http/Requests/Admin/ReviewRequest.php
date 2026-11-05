<?php

namespace App\Http\Requests\Admin;

use App\Models\Review;
use App\Support\YouTube;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'video_file' => ['nullable', 'file', 'mimes:mp4,mov', 'max:51200'],
            'thumbnail_file' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
            'clear_video' => ['nullable', 'boolean'],
            'clear_youtube' => ['nullable', 'boolean'],
            'youtube_url' => [
                'nullable',
                'string',
                'max:255',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $review = $this->route('review');
                    $existingVideoPath = $review instanceof Review ? $review->video_path : null;
                    $hasStoredHostedVideo = is_string($existingVideoPath) && $existingVideoPath !== '' && ! $this->boolean('clear_video');

                    if ($value === null || $value === '') {
                        if (! $this->hasFile('video_file') && ! $hasStoredHostedVideo) {
                            $fail('Provide a hosted video file or a valid YouTube URL.');
                        }

                        return;
                    }

                    $hasHostedVideo = $this->hasFile('video_file') || $hasStoredHostedVideo;

                    if ($hasHostedVideo) {
                        $fail('Choose either a hosted video file or a YouTube URL, not both.');

                        return;
                    }

                    if (YouTube::extractVideoId(is_string($value) ? $value : null) === null) {
                        $fail('Enter a valid YouTube video URL.');
                    }
                },
            ],
            'is_active' => ['boolean'],
            'video_id' => ['nullable', 'string', 'max:32'],
            'order' => ['nullable', 'array'],
        ];
    }
}
