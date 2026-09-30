<?php

namespace App\Models;

use Database\Factories\BlockedIpFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $ip_address
 * @property string|null $reason
 * @property Carbon $blocked_at
 * @property Carbon|null $expires_at
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class BlockedIp extends Model
{
    /** @use HasFactory<BlockedIpFactory> */
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'reason',
        'blocked_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'blocked_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function isCurrentlyBlocking(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        return $this->expires_at === null || $this->expires_at->isFuture();
    }
}
