<?php

use App\Actions\Partners\ImportBundledPartnerLogosAction;
use App\Models\PartnerLogo;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Moves the certification logos that were hard-coded into the storefront
     * into the partner logo CMS so the live page is unchanged after deploy.
     * Skipped under test so every test starts empty (the action itself is
     * covered by its own test).
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        app(ImportBundledPartnerLogosAction::class)->execute();
    }

    public function down(): void
    {
        $paths = PartnerLogo::query()
            ->where('image_path', 'like', 'partners/imported-%')
            ->pluck('image_path');

        Storage::disk(PartnerLogo::DISK)->delete($paths->all());
        PartnerLogo::query()->whereIn('image_path', $paths)->delete();
    }
};
