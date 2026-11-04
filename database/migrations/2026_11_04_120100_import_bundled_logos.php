<?php

use App\Actions\Logos\ImportBundledLogosAction;
use App\Models\Logo;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Moves the logo files that were hard-coded into the site into the logo
     * CMS so the live site is unchanged after deploy. Skipped under test so
     * every test starts with no uploaded logos (the action itself is covered
     * by its own test).
     */
    public function up(): void
    {
        if (app()->runningUnitTests()) {
            return;
        }

        app(ImportBundledLogosAction::class)->execute();
    }

    public function down(): void
    {
        $logos = Logo::query()->where('image_path', 'like', 'logos/imported-%')->get();

        foreach ($logos as $logo) {
            Storage::disk(Logo::DISK)->delete($logo->paths());
            $logo->delete();
        }
    }
};
