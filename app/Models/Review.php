<?php

namespace App\Models;

use Database\Factories\ReviewFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A customer video testimonial shown in the storefront's review carousel.
 * Hosted files are stored in the public disk; YouTube URLs remain supported for
 * legacy data, but the storefront now renders HTML5 video to keep the shorts
 * framing fixed and free of YouTube chrome.
 *
 * @property int $id
 * @property string|null $youtube_url
 * @property string|null $video_id
 * @property string|null $video_path
 * @property string|null $thumbnail_path
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    public const DISK = 'public';

    protected $fillable = [
        'youtube_url',
        'video_id',
        'video_path',
        'thumbnail_path',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function videoUrl(): ?string
    {
        if (! is_string($this->video_path) || $this->video_path === '') {
            return null;
        }

        // Root-relative so it works on whichever host the site is served from.
        return '/storage/'.ltrim($this->video_path, '/');
    }

    public function thumbnailUrl(): ?string
    {
        if (is_string($this->thumbnail_path) && $this->thumbnail_path !== '') {
            return '/storage/'.ltrim($this->thumbnail_path, '/');
        }

        return null;
    }
}
