<?php

use App\Support\IpAddress;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Canonicalizes any pre-existing blocked_ips.ip_address values (e.g. an
 * IPv4-mapped IPv6 literal) so BlockDisallowedIps' now-normalized comparison
 * actually matches rows created before normalization existed.
 *
 * This table is small and admin-managed, but is still handled defensively:
 * if normalizing two rows would make them collide (both represent the same
 * address), the one still actively blocking wins and the other is dropped,
 * rather than letting the unique constraint abort the migration.
 */
return new class extends Migration
{
    public function up(): void
    {
        $rows = DB::table('blocked_ips')->orderBy('id')->get();
        $seen = [];

        foreach ($rows as $row) {
            $normalized = IpAddress::normalize($row->ip_address);

            if (! isset($seen[$normalized])) {
                $seen[$normalized] = $row;

                if ($normalized !== $row->ip_address) {
                    DB::table('blocked_ips')->where('id', $row->id)->update(['ip_address' => $normalized]);
                }

                continue;
            }

            // A duplicate after normalization: keep whichever of the two is
            // still actively blocking (or the earlier row if both/neither
            // are), and drop the other rather than violate the unique index.
            $kept = $seen[$normalized];

            if (! $kept->is_active && $row->is_active) {
                DB::table('blocked_ips')->where('id', $kept->id)->delete();
                DB::table('blocked_ips')->where('id', $row->id)->update(['ip_address' => $normalized]);
                $seen[$normalized] = $row;
            } else {
                DB::table('blocked_ips')->where('id', $row->id)->delete();
            }
        }
    }

    public function down(): void
    {
        // Not reversible: the pre-normalization textual form of an address
        // isn't preserved, and dropped duplicate rows can't be reconstructed.
    }
};
