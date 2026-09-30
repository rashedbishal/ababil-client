<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The CourierStatus enum was expanded from 8 coarse buckets to Pathao's 22
 * real order statuses. Rows written under the old enum (submitted,
 * picked_up, delivered, failed, cancelled, ...) now fail to cast, since
 * those backing values no longer exist on the enum.
 *
 * Values here are intentionally hardcoded rather than referencing
 * App\Enums\CourierStatus - this migration fixes data as of *this* schema
 * version and must keep working even if the enum changes again later.
 */
return new class extends Migration
{
    private const VALID_STATUSES = [
        'not_submitted', 'pending', 'at_sorting', 'first_mile_hub', 'assigned_for_delivery',
        'at_delivery_hub', 'in_transit', 'on_hold', 'reattempt_requested', 'delivery',
        'partial_delivery', 'exchange', 'return_requested', 'return_at_sorting', 'return_in_transit',
        'assigned_for_return', 'return_to_merchant', 'returned', 'paid_return', 'returned_to_inventory',
        'reprocess_pending', 'reprocessed', 'at_inventory', 'unknown',
    ];

    /**
     * Old coarse status => raw-status match => new precise status. Applied
     * when the raw status text doesn't resolve anything more specific.
     */
    private const LEGACY_FALLBACK = [
        'submitted' => 'pending',
        'picked_up' => 'assigned_for_delivery',
        'in_transit' => 'in_transit',
        'delivered' => 'delivery',
        'failed' => 'on_hold',
        'returned' => 'returned',
        'cancelled' => 'unknown',
    ];

    public function up(): void
    {
        DB::table('orders')
            ->whereNotNull('courier_status')
            ->whereNotIn('courier_status', self::VALID_STATUSES)
            ->orderBy('id')
            ->select('id', 'courier_status', 'courier_raw_status')
            ->get()
            ->each(function (object $order): void {
                DB::table('orders')
                    ->where('id', $order->id)
                    ->update(['courier_status' => $this->remap($order->courier_status, $order->courier_raw_status)]);
            });
    }

    private function remap(string $legacyStatus, ?string $rawStatus): string
    {
        $fromRaw = $this->matchRawStatus($rawStatus);

        return $fromRaw ?? self::LEGACY_FALLBACK[$legacyStatus] ?? 'unknown';
    }

    /**
     * Re-derives the precise status from courier_raw_status - the actual
     * text Pathao sent - since it's more accurate than guessing from the
     * old coarse bucket alone. Mirrors PathaoCourierService::mapStatus().
     */
    private function matchRawStatus(?string $rawStatus): ?string
    {
        if ($rawStatus === null) {
            return null;
        }

        $normalized = trim((string) preg_replace('/[^a-z0-9]+/', '_', strtolower($rawStatus)), '_');

        return match ($normalized) {
            'pending' => 'pending',
            'at_sorting', 'at_sorting_hub' => 'at_sorting',
            'first_mile_hub' => 'first_mile_hub',
            'assigned_for_delivery' => 'assigned_for_delivery',
            'at_delivery_hub' => 'at_delivery_hub',
            'in_transit' => 'in_transit',
            'on_hold' => 'on_hold',
            'reattempt_requested' => 'reattempt_requested',
            'delivery' => 'delivery',
            'partial_delivery' => 'partial_delivery',
            'exchange' => 'exchange',
            'return_requested' => 'return_requested',
            'return_at_sorting' => 'return_at_sorting',
            'return_in_transit' => 'return_in_transit',
            'assigned_for_return' => 'assigned_for_return',
            'return_to_merchant' => 'return_to_merchant',
            'returned' => 'returned',
            'paid_return' => 'paid_return',
            'returned_to_inventory', 'return_to_inventory' => 'returned_to_inventory',
            'reprocess_pending' => 'reprocess_pending',
            'reprocessed' => 'reprocessed',
            'at_inventory' => 'at_inventory',
            default => null,
        };
    }

    /**
     * Not reversible: the old enum's backing values no longer exist in code,
     * so there's nothing meaningful to roll back to.
     */
    public function down(): void {}
};
