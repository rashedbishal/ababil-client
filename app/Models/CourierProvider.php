<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Per-provider courier credentials and settings, editable from the admin
 * Courier Integration page instead of .env. Credentials are encrypted at
 * rest and are never sent back to the browser once saved - the admin UI
 * only ever shows whether a field is set, not its value.
 *
 * @property int $id
 * @property string $name
 * @property array<string, mixed> $credentials
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CourierProvider extends Model
{
    protected $fillable = [
        'name',
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'credentials' => 'encrypted:array',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function credentialsFor(string $name): array
    {
        $provider = static::query()->where('name', $name)->first();

        return $provider !== null ? $provider->credentials : [];
    }

    /**
     * Merge new values into a provider's stored credentials. Any key whose
     * value is null or an empty string is skipped, so blank form fields
     * ("leave unchanged") never overwrite an already-saved secret.
     *
     * @param  array<string, mixed>  $values
     */
    public static function mergeCredentials(string $name, array $values): void
    {
        $provider = static::query()->firstOrCreate(['name' => $name], ['credentials' => []]);

        $updates = array_filter($values, fn ($value) => $value !== null && $value !== '');

        $provider->update([
            'credentials' => [...$provider->credentials, ...$updates],
        ]);
    }
}
