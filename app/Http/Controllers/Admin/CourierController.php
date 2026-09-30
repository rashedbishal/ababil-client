<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\CourierException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CourierCredentialsRequest;
use App\Models\CourierProvider;
use App\Models\Setting;
use App\Services\Courier\PathaoCourierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CourierController extends Controller
{
    /**
     * Provider credentials and the default provider are configured from
     * this page and stored encrypted in the database - never in .env, and
     * secret values are never sent back to the browser once saved.
     */
    public function index(): Response
    {
        $defaultProvider = Setting::get('courier_default_provider');
        $providers = [];

        foreach ($this->providerDefinitions() as $name => $definition) {
            $credentials = CourierProvider::credentialsFor($name);
            $fields = [];

            foreach ($definition['fields'] as $key => $field) {
                $fields[] = [
                    'key' => $key,
                    'label' => $field['label'],
                    'secret' => $field['secret'],
                    // Secret values are never exposed - only whether one is set.
                    'value' => $field['secret'] ? null : ($credentials[$key] ?? $field['default'] ?? null),
                    'configured' => ! empty($credentials[$key]),
                ];
            }

            $providers[] = [
                'name' => $name,
                'label' => $definition['label'],
                'is_default' => $name === $defaultProvider,
                'fields' => $fields,
                'store' => $name === 'pathao' && isset($credentials['store_id']) ? [
                    'id' => $credentials['store_id'],
                    'name' => $credentials['store_name'] ?? null,
                ] : null,
            ];
        }

        return Inertia::render('admin/courier/index', [
            'defaultProvider' => $defaultProvider,
            'providers' => $providers,
        ]);
    }

    /**
     * @return array<string, array{label: string, fields: array<string, array{label: string, secret: bool, default?: string}>}>
     */
    private function providerDefinitions(): array
    {
        return config('courier.providers');
    }

    public function update(CourierCredentialsRequest $request, string $provider): RedirectResponse
    {
        CourierProvider::mergeCredentials($provider, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Credentials saved.']);

        return back();
    }

    public function setDefault(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'provider' => ['nullable', Rule::in(array_keys($this->providerDefinitions()))],
        ]);

        Setting::set('courier_default_provider', $data['provider'] ?? null);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Default courier provider updated.']);

        return back();
    }

    /**
     * Live-fetches the merchant's stores from Pathao, for the store
     * selection dropdown. Uses whatever credentials are currently saved,
     * regardless of which provider is set as default.
     */
    public function fetchPathaoStores(): JsonResponse
    {
        try {
            $stores = app(PathaoCourierService::class)->listStores();
        } catch (CourierException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['stores' => $stores]);
    }

    public function selectPathaoStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'store_id' => ['required', 'integer'],
            'store_name' => ['required', 'string', 'max:255'],
        ]);

        CourierProvider::mergeCredentials('pathao', [
            'store_id' => (string) $data['store_id'],
            'store_name' => $data['store_name'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pathao store saved.']);

        return back();
    }
}
