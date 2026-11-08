<?php

namespace App\Models;

use Database\Factories\HeroBannerSlideFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * A single hero-banner slide. Each slide can be uploaded as three versions:
 * desktop, tab, and mobile. If a version is missing, the app falls back to a
 * different version and crops to fit the breakpoint so the layout still works,
 * but the visual quality is reduced.
 *
 * @property int $id
 * @property string|null $desktop_image_path
 * @property string|null $tab_image_path
 * @property string|null $mobile_image_path
 * @property string $alt
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class HeroBannerSlide extends Model
{
    /** @use HasFactory<HeroBannerSlideFactory> */
    use HasFactory;

    public const DISK = 'public';

    public const VARIANTS = ['desktop', 'tab', 'mobile'];

    protected $fillable = [
        'desktop_image_path',
        'tab_image_path',
        'mobile_image_path',
        'alt',
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

    /**
     * @return array<int, string>
     */
    public function missingVariants(): array
    {
        return array_values(array_filter(self::VARIANTS, fn (string $variant) => empty($this->{"{$variant}_image_path"})));
    }

    public function imageUrl(string $variant): string
    {
        $path = $this->{"{$variant}_image_path"};

        if (! is_string($path) || $path === '') {
            return '';
        }

        return Storage::disk(self::DISK)->url($path);
    }

    public function imageUrlForVariant(string $variant): string
    {
        $candidates = match ($variant) {
            'desktop' => ['desktop', 'tab', 'mobile'],
            'tab' => ['tab', 'desktop', 'mobile'],
            'mobile' => ['mobile', 'tab', 'desktop'],
            default => self::VARIANTS,
        };

        foreach ($candidates as $candidate) {
            $url = $this->imageUrl($candidate);

            if ($url !== '') {
                return $url;
            }
        }

        return '';
    }
}
