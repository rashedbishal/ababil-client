<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CourierController extends Controller
{
    /**
     * Read-only placeholder: shows which courier provider (if any) is
     * configured via environment variables. Credentials are never
     * displayed - only whether each is set - and are never editable here,
     * since courier secrets must live in .env, not the database.
     */
    public function index(): Response
    {
        $providers = collect($this->providerConfigs())
            ->map(fn (array $config, string $name) => [
                'name' => $name,
                'configured' => collect($config)->filter()->isNotEmpty(),
            ])
            ->values();

        return Inertia::render('admin/courier/index', [
            'defaultProvider' => config('courier.default'),
            'providers' => $providers,
        ]);
    }

    /**
     * @return array<string, array<string, string|null>>
     */
    private function providerConfigs(): array
    {
        return config('courier.providers');
    }
}
