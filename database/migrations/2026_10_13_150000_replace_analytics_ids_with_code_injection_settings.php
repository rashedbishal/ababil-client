<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * The old ID-only settings (google_tag_manager_id, facebook_pixel_id,
     * google_analytics_id) are replaced by raw head_code/body_code snippets
     * pasted by the admin - the stored IDs aren't valid in the new format,
     * so they're removed rather than migrated.
     */
    public function up(): void
    {
        Setting::query()
            ->whereIn('key', ['google_tag_manager_id', 'facebook_pixel_id', 'google_analytics_id'])
            ->delete();
    }

    public function down(): void
    {
        Setting::query()
            ->whereIn('key', ['head_code', 'body_code'])
            ->delete();
    }
};
