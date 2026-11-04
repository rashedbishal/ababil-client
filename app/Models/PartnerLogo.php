<?php

namespace App\Models;

use Database\Factories\PartnerLogoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * One logo + label in the storefront's certification/partner strip
 * ("গুণগত মানে আস্থার প্রতিশ্রুতি").
 *
 * @property int $id
 * @property string $image_path
 * @property string $label
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class PartnerLogo extends Model
{
    /** @use HasFactory<PartnerLogoFactory> */
    use HasFactory;

    public const DISK = 'public';

    /**
     * Logos are shown in a ~88px square on the storefront; 280px stays sharp
     * on 3x phone screens.
     */
    public const IMAGE_SIZE = 280;

    public const IMAGE_MAX_KB = 1024;

    /**
     * Keeps the label to two lines under its tile on the narrowest mobile
     * layout.
     */
    public const LABEL_MAX_LENGTH = 30;

    protected $fillable = [
        'image_path',
        'label',
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

    public function imageUrl(): string
    {
        return Storage::disk(self::DISK)->url($this->image_path);
    }
}
