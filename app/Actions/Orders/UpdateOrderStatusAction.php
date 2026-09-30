<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateOrderStatusAction
{
    public function execute(Order $order, OrderStatus $status, ?User $changedBy, ?string $note = null): Order
    {
        DB::transaction(function () use ($order, $status, $changedBy, $note): void {
            $from = $order->status;

            $timestamps = match ($status) {
                OrderStatus::Confirmed => ['confirmed_at' => now()],
                OrderStatus::Shipped => ['shipped_at' => now()],
                OrderStatus::Delivered => ['delivered_at' => now()],
                OrderStatus::Cancelled => ['cancelled_at' => now()],
                default => [],
            };

            $order->update([
                'status' => $status,
                ...$timestamps,
            ]);

            OrderStatusHistory::query()->create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => $status,
                'note' => $note,
                'changed_by' => $changedBy?->id,
            ]);
        });

        return $order->refresh();
    }
}
