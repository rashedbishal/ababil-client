<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incomplete_orders', function (Blueprint $table) {
            $table->id();
            $table->string('session_token')->unique();

            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->unsignedInteger('quantity')->nullable();

            $table->string('customer_name')->nullable();
            $table->string('customer_phone')->nullable();
            $table->text('delivery_address')->nullable();
            $table->foreignId('shipping_area_id')->nullable()->constrained()->nullOnDelete();

            $table->string('customer_ip', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->string('conversion_status')->default('pending');
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();

            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            $table->index('conversion_status');
            $table->index('customer_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomplete_orders');
    }
};
