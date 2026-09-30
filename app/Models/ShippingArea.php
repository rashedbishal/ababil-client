<?php

namespace App\Models;

use Database\Factories\ShippingAreaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $charge
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ShippingArea extends Model
{
    /** @use HasFactory<ShippingAreaFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'charge',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'charge' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
