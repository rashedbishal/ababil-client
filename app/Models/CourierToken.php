<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Persisted OAuth token for a courier provider (one row per provider name).
 *
 * @property int $id
 * @property string $provider
 * @property string $access_token
 * @property string|null $refresh_token
 * @property Carbon $expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CourierToken extends Model
{
    protected $fillable = [
        'provider',
        'access_token',
        'refresh_token',
        'expires_at',
    ];

    /**
     * Nothing in the app currently serializes this model (it's only ever
     * read directly by PathaoCourierService), but hiding these means a
     * future accidental Inertia::render()/API response including it still
     * can't leak a live token.
     */
    protected $hidden = [
        'access_token',
        'refresh_token',
    ];

    protected function casts(): array
    {
        return [
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'expires_at' => 'datetime',
        ];
    }

    public function isValid(): bool
    {
        return $this->expires_at->isFuture();
    }
}
