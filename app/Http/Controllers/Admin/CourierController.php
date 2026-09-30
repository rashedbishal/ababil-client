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
        // While Steadfast and RedX are both disabled, Pathao - the only
        // provider with a real integration - is pinned as the permanent
        // default and can't be unset or swapped out from this page.
        $pathaoForced = $this->pathaoIsForced();
        $defaultProvider = $pathaoForced ? 'pathao' : Setting::get('courier_default_provider');
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
                'enabled' => $this->isProviderEnabled($name),
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
            'canChangeDefault' => ! $pathaoForced,
            'providers' => $providers,
        ]);
    }

    /**
     * @return array<string, array{label: string, fields: array<string, array{label: string, secret: bool, default?: string}>, enabled?: bool}>
     */
    private function providerDefinitions(): array
    {
        return config('courier.providers');
    }

    /**
     * Pathao has no 'enabled' flag - it's the only provider with a real
     * CourierServiceInterface implementation, so it's always available.
     */
    private function isProviderEnabled(string $provider): bool
    {
        return (bool) (config("courier.providers.{$provider}.enabled") ?? true);
    }

    /**
     * True while neither Steadfast nor RedX is enabled - the only scenario
     * where Pathao is the sole usable provider and must stay pinned as
     * default.
     */
    private function pathaoIsForced(): bool
    {
        return ! $this->isProviderEnabled('steadfast') && ! $this->isProviderEnabled('redx');
    }

    public function update(CourierCredentialsRequest $request, string $provider): RedirectResponse
    {
        if (! $this->isProviderEnabled($provider)) {
            abort(403, 'This courier provider is disabled.');
        }

        CourierProvider::mergeCredentials($provider, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Credentials saved.']);

        return back();
    }

    public function setDefault(Request $request): RedirectResponse
    {
        if ($this->pathaoIsForced()) {
            abort(403, 'Pathao is the only enabled courier provider and must stay the default.');
        }

        $enabledProviders = array_keys(array_filter(
            $this->providerDefinitions(),
            fn (array $definition, string $name): bool => $this->isProviderEnabled($name),
            ARRAY_FILTER_USE_BOTH,
        ));

        $data = $request->validate([
            'provider' => ['nullable', Rule::in($enabledProviders)],
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
