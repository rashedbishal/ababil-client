<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

/**
 * @property int $id
 * @property string $key
 * @property string|null $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    public static function get(string $key, ?string $default = null): ?string
    {
        // The default is applied after the cache read, not baked into what
        // gets cached - otherwise two call sites passing different defaults
        // for the same (missing) key would get whichever one ran first,
        // cached forever, regardless of what the other one asked for.
        $value = Cache::rememberForever(
            "settings.{$key}",
            fn (): ?string => static::query()->where('key', $key)->value('value'),
        );

        return $value ?? $default;
    }

    public static function set(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);

        Cache::forget("settings.{$key}");
    }

    /**
     * Like get(), but for a value that must not sit in the database in
     * plaintext (e.g. an API access token) - the same guarantee
     * `courier_providers.credentials` makes, extended to this generic
     * key/value store. A value saved before encryption was added, or one
     * that fails to decrypt for any other reason, is treated as unset
     * rather than thrown back at the caller.
     */
    public static function getEncrypted(string $key): ?string
    {
        $value = static::get($key);

        if ($value === null) {
            return null;
        }

        try {
            return Crypt::decryptString($value);
        } catch (DecryptException) {
            return null;
        }
    }

    public static function setEncrypted(string $key, ?string $value): void
    {
        static::set($key, $value !== null ? Crypt::encryptString($value) : null);
    }
}
