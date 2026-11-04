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
        Schema::create('logos', function (Blueprint $table) {
            $table->id();
            $table->string('slot', 20)->unique();
            $table->string('image_path');
            // Extra generated files for a slot, keyed by name (the favicon's
            // 48px / 192px / apple-touch icons). Null for a single-file slot.
            $table->json('variants')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logos');
    }
};
