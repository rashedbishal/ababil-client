<?php

namespace App\Models;

use App\Enums\CourierStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

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
 * @property Carbon|null $deleted_at
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory, SoftDeletes;

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

    /**
     * Whether this order is still submitted to a courier and in a status
     * that could still usefully change via polling - independent of sync
     * mode, since even a manually-managed order's Courier card should still
     * reflect Pathao's latest reported status. Once an order is Delivered,
     * Cancelled, or Returned, the shipment is settled and polling it again
     * on every page visit would just be a wasted call.
     */
    public function courierConsignmentInFlight(): bool
    {
        return $this->courier_consignment_id !== null
            && ! in_array($this->status, OrderStatus::terminal(), true);
    }

    /**
     * Whether this order's courier status is worth polling right now:
     * automated sync mode, already submitted to the courier, and not yet in
     * a status that will never usefully change again via polling.
     */
    public function needsCourierRefresh(): bool
    {
        return $this->status_sync_mode === OrderStatusSyncMode::Automated
            && $this->courierConsignmentInFlight();
    }

    /**
     * Query-level equivalent of needsCourierRefresh(), for selecting which
     * orders to poll without loading every order into memory first.
     *
     * @param  Builder<Order>  $query
     * @return Builder<Order>
     */
    public function scopeNeedsCourierRefresh(Builder $query): Builder
    {
        return $query
            ->where('status_sync_mode', OrderStatusSyncMode::Automated)
            ->whereNotNull('courier_consignment_id')
            ->whereNotIn('status', array_map(fn (OrderStatus $s) => $s->value, OrderStatus::terminal()));
    }

    /**
     * The status text to show an admin. For a manually-managed order this is
     * just our own status label. For an automated order, Pathao's own status
     * is shown instead (e.g. "Assigned for Delivery") rather than the
     * coarser internal status it implies (e.g. "Shipped") - falling back to
     * a humanized version of the raw courier text when it's one we don't
     * recognize yet, rather than showing "Unknown".
     */
    public function displayStatusLabel(): string
    {
        if ($this->status_sync_mode === OrderStatusSyncMode::Automated) {
            if ($this->courier_status !== null && $this->courier_status !== CourierStatus::Unknown) {
                return $this->courier_status->label();
            }

            if ($this->courier_raw_status !== null && trim($this->courier_raw_status) !== '') {
                return (string) Str::of($this->courier_raw_status)
                    ->replace(['_', '-'], ' ')
                    ->squish()
                    ->title();
            }
        }

        return $this->status->label();
    }
}
