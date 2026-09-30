<?php

namespace App\Models;

use App\Enums\IncompleteOrderConversionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $session_token
 * @property int|null $product_id
 * @property int|null $variant_id
 * @property int|null $quantity
 * @property string|null $customer_name
 * @property string|null $customer_phone
 * @property string|null $delivery_address
 * @property int|null $shipping_area_id
 * @property string|null $customer_ip
 * @property string|null $user_agent
 * @property IncompleteOrderConversionStatus $conversion_status
 * @property int|null $order_id
 * @property Carbon|null $last_activity_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class IncompleteOrder extends Model
{
    protected $fillable = [
        'session_token',
        'product_id',
        'variant_id',
        'quantity',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'shipping_area_id',
        'customer_ip',
        'user_agent',
        'conversion_status',
        'order_id',
        'last_activity_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'conversion_status' => IncompleteOrderConversionStatus::class,
            'last_activity_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * @return BelongsTo<ShippingArea, $this>
     */
    public function shippingArea(): BelongsTo
    {
        return $this->belongsTo(ShippingArea::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
