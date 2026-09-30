<?php

namespace App\Models;

use App\Support\Decimal;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $sku
 * @property string|null $short_description
 * @property string|null $description
 * @property string $regular_price
 * @property string|null $sale_price
 * @property int|null $featured_image_id
 * @property bool $track_stock
 * @property int $stock
 * @property string $weight
 * @property bool $is_active
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'regular_price',
        'sale_price',
        'featured_image_id',
        'track_stock',
        'stock',
        'weight',
        'is_active',
        'meta_title',
        'meta_description',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'regular_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'track_stock' => 'boolean',
            'stock' => 'integer',
            'weight' => 'decimal:2',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Media, $this>
     */
    public function featuredImage(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'featured_image_id');
    }

    /**
     * @return HasMany<ProductImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * The price actually charged: sale price when set and lower than regular price.
     *
     * @return numeric-string
     */
    public function currentPrice(): string
    {
        if ($this->sale_price !== null && bccomp(Decimal::of($this->sale_price), Decimal::of($this->regular_price), 2) < 0) {
            return Decimal::of($this->sale_price);
        }

        return Decimal::of($this->regular_price);
    }

    public function hasVariants(): bool
    {
        return $this->variants()->exists();
    }
}
