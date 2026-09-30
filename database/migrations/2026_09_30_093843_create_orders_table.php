<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();

            $table->string('customer_name');
            $table->string('customer_phone');
            $table->text('delivery_address');
            $table->foreignId('shipping_area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('shipping_area_name');

            $table->decimal('subtotal', 10, 2);
            $table->decimal('shipping_charge', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2);

            $table->string('status')->default('pending');
            $table->string('courier_status')->nullable();

            $table->string('customer_ip', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('customer_note')->nullable();
            $table->text('admin_note')->nullable();

            $table->string('courier_provider')->nullable();
            $table->string('courier_consignment_id')->nullable();
            $table->string('courier_tracking_code')->nullable();

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('customer_phone');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
