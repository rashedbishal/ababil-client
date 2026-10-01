<?php

namespace App\Models;

use App\Enums\CourierStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $order_number
 * @property string $customer_name
 * @property string $customer_phone
 * @property string $delivery_address
 * @property int|null $shipping_area_id
 * @property string $shipping_area_name
 * @property string $subtotal
 * @property string $shipping_charge
 * @property string $discount
 * @property string $grand_total
 * @property OrderStatus $status
 * @property CourierStatus|null $courier_status
 * @property string|null $courier_raw_status
 * @property OrderStatusSyncMode $status_sync_mode
 * @property string|null $customer_ip
 * @property string|null $user_agent
 * @property string|null $customer_note
 * @property string|null $admin_note
 * @property string|null $courier_provider
 * @property string|null $courier_consignment_id
 * @property string|null $courier_tracking_code
 * @property Carbon|null $confirmed_at
 * @property Carbon|null $shipped_at
 * @property Carbon|null $delivered_at
 * @property Carbon|null $cancelled_at
 * @property Carbon|null $viewed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_phone',
        'delivery_address',
        'shipping_area_id',
        'shipping_area_name',
        'subtotal',
        'shipping_charge',
        'discount',
        'grand_total',
        'status',
        'courier_status',
        'courier_raw_status',
        'status_sync_mode',
        'customer_ip',
        'user_agent',
        'customer_note',
        'admin_note',
        'courier_provider',
        'courier_consignment_id',
        'courier_tracking_code',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'viewed_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'shipping_charge' => 'decimal:2',
            'discount' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'status' => OrderStatus::class,
            'courier_status' => CourierStatus::class,
            'status_sync_mode' => OrderStatusSyncMode::class,
            'confirmed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'viewed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<ShippingArea, $this>
     */
    public function shippingArea(): BelongsTo
    {
        return $this->belongsTo(ShippingArea::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasMany<OrderStatusHistory, $this>
     */
    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('created_at');
    }

    /**
     * @return HasOne<IncompleteOrder, $this>
     */
    public function incompleteOrder(): HasOne
    {
        return $this->hasOne(IncompleteOrder::class);
    }
}
