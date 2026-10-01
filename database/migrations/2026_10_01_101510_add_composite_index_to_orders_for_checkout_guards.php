<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * PlaceOrderAction's velocity guard and duplicate-order check both filter
 * orders by customer_phone AND created_at together on every single checkout
 * - the two columns were only ever indexed separately, so one predicate had
 * to be applied as a row-by-row filter after the other's index seek.
 *
 * The standalone customer_phone index becomes redundant once this composite
 * exists (a leading-column index serves lookups on customer_phone alone too,
 * and nothing in the app queries customer_phone without created_at - the
 * admin search uses a leading-wildcard LIKE, which can't use either index),
 * so it's dropped here rather than left as dead weight on every write.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['customer_phone']);
            $table->index(['customer_phone', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['customer_phone', 'created_at']);
            $table->index('customer_phone');
        });
    }
};
