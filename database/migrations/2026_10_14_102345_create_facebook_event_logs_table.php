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
        Schema::create('facebook_event_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            // Snapshotted so the log row stays readable even after the
            // order is force-deleted (order_id goes null) - same reasoning
            // as order_items snapshotting product name/price/etc.
            $table->string('order_number')->nullable();
            $table->string('event_name');
            $table->string('status');
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('facebook_event_logs');
    }
};
