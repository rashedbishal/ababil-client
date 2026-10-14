<?php

namespace App\Models;

use App\Enums\FacebookEventLogStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One row per attempted Facebook/Meta Conversions API call
 * (App\Services\Facebook\FacebookConversionsApiService), shown on the admin
 * Meta Event Log page for diagnosing why a conversion did or didn't reach
 * Meta. Written for every attempt, including retries queued after a
 * failure - a persistently failing order can have several rows.
 *
 * @property int $id
 * @property int|null $order_id
 * @property string|null $order_number
 * @property string $event_name
 * @property FacebookEventLogStatus $status
 * @property int|null $http_status
 * @property string|null $message
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class FacebookEventLog extends Model
{
    protected $fillable = [
        'order_id',
        'order_number',
        'event_name',
        'status',
        'http_status',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'status' => FacebookEventLogStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
