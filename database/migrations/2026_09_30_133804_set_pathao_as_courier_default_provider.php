<?php

use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

/**
 * Pathao is the only courier provider with a real CourierServiceInterface
 * implementation - Steadfast/RedX are placeholders. Any existing
 * courier_default_provider value other than 'pathao' (null, 'steadfast',
 * 'redx') would silently resolve to NullCourierService, so this corrects
 * it once. Going forward, the admin Courier Integration page won't let it
 * drift away from 'pathao' while Steadfast/RedX stay disabled.
 */
return new class extends Migration
{
    public function up(): void
    {
        Setting::set('courier_default_provider', 'pathao');
    }

    /**
     * Not meaningfully reversible - there's no prior value worth restoring.
     */
    public function down(): void {}
};
