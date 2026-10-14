<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('facebook_event_logs', function (Blueprint $table) {
            // The CAPI event_id (currently always the order_number - see
            // FacebookConversionsApiService) as its own column, separate
            // from order_number, since what matters for admins cross-
            // checking Meta's Events Manager is this exact value, not
            // that it happens to equal the order number today.
            $table->string('event_id')->nullable()->after('event_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facebook_event_logs', function (Blueprint $table) {
            $table->dropColumn('event_id');
        });
    }
};
