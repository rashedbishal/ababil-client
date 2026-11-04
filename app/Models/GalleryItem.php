<?php

namespace App\Models;

use App\Enums\GallerySection;
use Database\Factories\GalleryItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * One photo + caption in a storefront gallery section. `alt` is only set for
 * photos imported with hand-written alt text; the storefront falls back to
 * the caption when it's null.
 *
 * @property int $id
 * @property GallerySection $section
 * @property string $image_path
 * @property string|null $alt
 * @property string $caption
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class GalleryItem extends Model
{
    /** @use HasFactory<GalleryItemFactory> */
    use HasFactory;

    public const DISK = 'public';

    /**
     * Gallery photos are shown as squares at most ~380px wide on the
     * storefront, so 800px is sharp on 2x screens without being heavy.
     */
    public const IMAGE_SIZE = 800;

    public const IMAGE_MAX_KB = 1024;

    /**
     * Keeps a caption to 4 lines or fewer in the narrowest (2-column) mobile
     * card.
     */
    public const CAPTION_MAX_LENGTH = 60;

    protected $fillable = [
        'section',
        'image_path',
        'alt',
        'caption',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'section' => GallerySection::class,
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function imageUrl(): string
    {
        return Storage::disk(self::DISK)->url($this->image_path);
    }
}
