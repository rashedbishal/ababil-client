<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }

    /**
     * Creates an admin user and acts as them for the current test. Shared
     * across admin-area tests instead of each file redefining its own
     * identical actingAsXxxAdmin() helper.
     *
     * @param  array<string, mixed>  $overrides
     */
    protected function actingAsAdmin(array $overrides = []): User
    {
        $admin = User::factory()->create(['is_admin' => true, ...$overrides]);
        $this->actingAs($admin);

        return $admin;
    }
}
