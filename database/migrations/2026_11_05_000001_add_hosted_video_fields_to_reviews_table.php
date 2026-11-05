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
        Schema::table('reviews', function (Blueprint $table): void {
            $table->string('youtube_url')->nullable()->change();
            $table->string('video_id', 20)->nullable()->change();
            $table->string('video_path')->nullable()->after('video_id');
            $table->string('thumbnail_path')->nullable()->after('video_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table): void {
            $table->dropColumn(['video_path', 'thumbnail_path']);
        });
    }
};
