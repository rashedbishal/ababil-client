<?php

namespace App\Models;

use App\Enums\LogoSlot;
use Database\Factories\LogoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * An uploaded logo for one LogoSlot. No row for a slot means "use the
 * bundled default", so the site never has a broken logo.
 *
 * @property int $id
 * @property LogoSlot $slot
 * @property string $image_path
 * @property array<string, string>|null $variants
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Logo extends Model
{
    /** @use HasFactory<LogoFactory> */
    use HasFactory;

    public const DISK = 'public';

    public const IMAGE_MAX_KB = 1024;

    private const CACHE_KEY = 'logos.urls';

    protected $fillable = [
        'slot',
        'image_path',
        'variants',
    ];

    protected function casts(): array
    {
        return [
            'slot' => LogoSlot::class,
            'variants' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::flushCache());
        static::deleted(fn () => static::flushCache());
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Public URLs of the uploaded logos, keyed by slot value, for the slots
     * that have one. `favicon` maps to its generated variants instead (see
     * faviconUrls()). Cached - this is read on every page load.
     *
     * @return array<string, mixed>
     */
    public static function urls(): array
    {
        // This is read on every page, including the few seconds during a
        // deploy between the new code going live and `migrate` creating the
        // table - fall back to "no uploads" (the bundled defaults) rather
        // than failing the whole site in that window. Not cached.
        try {
            return self::loadUrls();
        } catch (QueryException) {
            return [];
        }
    }

    /**
     * @return array<string, mixed>
     */
    private static function loadUrls(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function (): array {
            $disk = Storage::disk(self::DISK);
            $urls = [];

            foreach (static::query()->get() as $logo) {
                $urls[$logo->slot->value] = $logo->slot === LogoSlot::Favicon
                    ? collect($logo->variants ?? [])->map(fn (string $path) => $disk->url($path))->all()
                    : $disk->url($logo->image_path);
            }

            return $urls;
        });
    }

    public static function urlFor(LogoSlot $slot): ?string
    {
        $url = static::urls()[$slot->value] ?? null;

        return is_string($url) ? $url : null;
    }

    /**
     * The generated favicon files (`icon_48`, `icon_192`, `apple`) when a custom
     * favicon has been uploaded, otherwise null (the bundled icons apply).
     *
     * @return array<string, string>|null
     */
    public static function faviconUrls(): ?array
    {
        $urls = static::urls()[LogoSlot::Favicon->value] ?? null;

        return is_array($urls) && $urls !== [] ? $urls : null;
    }

    /**
     * Every file stored for this logo.
     *
     * @return list<string>
     */
    public function paths(): array
    {
        return array_values(array_unique([$this->image_path, ...array_values($this->variants ?? [])]));
    }
}
