<?php

namespace App\Services\Courier;

use App\Enums\CourierStatus;
use App\Exceptions\CourierException;
use App\Models\CourierProvider;
use App\Models\CourierToken;
use Closure;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Pathao Courier Merchant API integration.
 *
 * Built strictly from Pathao's documented Merchant API (issue-token,
 * orders, orders/{id}/info). Pathao does not document a cancel-order
 * endpoint, so cancelParcel() fails clearly rather than guessing one.
 * Pathao also does not publish a full list of order_status values (only
 * "Pending" appears in their docs), so getParcelStatus() maps what it can
 * recognize and always preserves the raw status text for admins.
 *
 * @see https://merchant.pathao.com Pathao Merchant API documentation
 */
class PathaoCourierService implements CourierServiceInterface
{
    private const PROVIDER = 'pathao';

    /**
     * @var array<string, mixed>|null
     */
    private ?array $config = null;

    public function createParcel(ParcelData $parcel): ParcelStatus
    {
        $storeId = $this->config()['store_id'] ?? null;

        if (empty($storeId)) {
            throw new CourierException('No Pathao store is selected. Choose one on the Courier Integration page.');
        }

        $response = $this->send(fn (PendingRequest $client) => $client->post('/aladdin/api/v1/orders', [
            'store_id' => (int) $storeId,
            'merchant_order_id' => $parcel->orderNumber,
            'recipient_name' => $parcel->recipientName,
            'recipient_phone' => $parcel->recipientPhone,
            'recipient_address' => $parcel->deliveryAddress,
            'delivery_type' => (int) ($this->config()['delivery_type'] ?? 48),
            'item_type' => (int) ($this->config()['item_type'] ?? 2),
            'item_quantity' => $parcel->itemQuantity,
            'item_weight' => number_format($parcel->itemWeightKg, 1, '.', ''),
            'item_description' => $parcel->itemDescription,
            'amount_to_collect' => (int) round((float) $parcel->codAmount),
        ]));

        $data = $this->data($response, 'Failed to create the Pathao parcel.');

        return new ParcelStatus(
            consignmentId: (string) $data['consignment_id'],
            status: $this->mapStatus($data['order_status'] ?? null),
            trackingCode: null,
            rawStatus: $data['order_status'] ?? null,
        );
    }

    /**
     * The merchant's stores, for the admin store-selection UI.
     *
     * @return array<int, array{id: int, name: string, address: string}>
     */
    public function listStores(): array
    {
        $response = $this->send(fn (PendingRequest $client) => $client->get('/aladdin/api/v1/stores'));

        $data = $this->data($response, 'Failed to fetch Pathao stores.');

        $stores = [];

        foreach ((array) ($data['data'] ?? []) as $store) {
            if (! is_array($store) || ! isset($store['store_id'], $store['store_name'])) {
                continue;
            }

            $stores[] = [
                'id' => (int) $store['store_id'],
                'name' => (string) $store['store_name'],
                'address' => (string) ($store['store_address'] ?? ''),
            ];
        }

        return $stores;
    }

    public function getParcelStatus(string $consignmentId): ParcelStatus
    {
        $response = $this->send(fn (PendingRequest $client) => $client->get("/aladdin/api/v1/orders/{$consignmentId}/info"));

        $data = $this->data($response, 'Failed to fetch the Pathao parcel status.');

        $rawStatus = $data['order_status_slug'] ?? $data['order_status'] ?? null;

        return new ParcelStatus(
            consignmentId: (string) ($data['consignment_id'] ?? $consignmentId),
            status: $this->mapStatus($rawStatus),
            trackingCode: null,
            rawStatus: $rawStatus,
        );
    }

    public function cancelParcel(string $consignmentId): bool
    {
        throw new CourierException(
            "Pathao's Merchant API documentation does not include a cancel-order endpoint, so this isn't implemented. Cancel the parcel from the Pathao merchant dashboard instead.",
        );
    }

    /**
     * This provider's saved credentials, loaded once per instance.
     *
     * @return array<string, mixed>
     */
    private function config(): array
    {
        return $this->config ??= CourierProvider::credentialsFor(self::PROVIDER);
    }

    /**
     * A configured Http client, authenticated with a valid access token.
     */
    private function client(): PendingRequest
    {
        $baseUrl = $this->config()['base_url'] ?? null;

        if (empty($baseUrl)) {
            throw new CourierException('Pathao base_url is not configured on the Courier Integration page.');
        }

        return Http::baseUrl(rtrim((string) $baseUrl, '/'))
            ->withToken($this->accessToken())
            ->acceptJson()
            ->asJson()
            // Pathao's documented API never redirects. Guzzle only strips
            // Authorization on a cross-origin redirect for 301/302/303 (and
            // empties the body); a 307/308 preserves the request exactly,
            // which would resend this bearer token wherever the allowed
            // host points if it were ever compromised or hijacked.
            ->withOptions(['allow_redirects' => false]);
    }

    /**
     * Sends an authenticated request, retrying once with a freshly issued
     * token if Pathao rejects the stored one with a 401. Our own expiry
     * bookkeeping only knows what Pathao told us when the token was issued -
     * it can't detect a token Pathao has since revoked server-side, which
     * would otherwise fail every request until the locally-tracked expiry
     * (hours or months away) finally catches up.
     */
    private function send(Closure $makeRequest): Response
    {
        $response = $makeRequest($this->client());

        if ($response->status() === 401) {
            $this->invalidateToken();
            $response = $makeRequest($this->client());
        }

        return $response;
    }

    private function invalidateToken(): void
    {
        CourierToken::query()->where('provider', self::PROVIDER)->delete();
    }

    /**
     * Returns a valid access token, issuing or refreshing one as needed.
     */
    private function accessToken(): string
    {
        $token = CourierToken::query()->where('provider', self::PROVIDER)->first();

        if ($token && $token->isValid()) {
            return $token->access_token;
        }

        if ($token?->refresh_token) {
            try {
                return $this->refreshToken($token->refresh_token);
            } catch (CourierException) {
                // Fall through to a fresh password-grant issue below.
            }
        }

        return $this->issueToken();
    }

    private function issueToken(): string
    {
        $config = $this->config();

        foreach (['client_id', 'client_secret', 'username', 'password'] as $key) {
            if (empty($config[$key])) {
                throw new CourierException("Pathao {$key} is not configured on the Courier Integration page.");
            }
        }

        $response = Http::baseUrl(rtrim((string) $config['base_url'], '/'))
            ->acceptJson()
            ->asJson()
            // See client()'s comment: a 307/308 redirect preserves the POST
            // body verbatim, which here contains the Pathao credentials
            // themselves, not just a bearer token.
            ->withOptions(['allow_redirects' => false])
            ->post('/aladdin/api/v1/issue-token', [
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'grant_type' => 'password',
                'username' => $config['username'],
                'password' => $config['password'],
            ]);

        return $this->storeToken($this->tokenPayload($this->data($response, 'Failed to authenticate with Pathao.')));
    }

    private function refreshToken(string $refreshToken): string
    {
        $config = $this->config();

        $response = Http::baseUrl(rtrim((string) $config['base_url'], '/'))
            ->acceptJson()
            ->asJson()
            ->withOptions(['allow_redirects' => false])
            ->post('/aladdin/api/v1/issue-token', [
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken,
            ]);

        if ($response->failed()) {
            throw new CourierException('Failed to refresh the Pathao access token.');
        }

        return $this->storeToken($this->tokenPayload($this->data($response, 'Failed to refresh the Pathao access token.')));
    }

    /**
     * Validates that Pathao's token response actually has the fields we
     * depend on before we trust it, since it's untyped JSON off the wire.
     *
     * @param  array<string, mixed>  $data
     * @return array{access_token: string, refresh_token: string|null, expires_in: int}
     */
    private function tokenPayload(array $data): array
    {
        if (! isset($data['access_token']) || ! is_string($data['access_token']) || ! isset($data['expires_in']) || ! is_int($data['expires_in'])) {
            throw new CourierException('Pathao returned an unexpected token response.');
        }

        return [
            'access_token' => $data['access_token'],
            'refresh_token' => isset($data['refresh_token']) && is_string($data['refresh_token']) ? $data['refresh_token'] : null,
            'expires_in' => $data['expires_in'],
        ];
    }

    /**
     * @param  array{access_token: string, refresh_token: string|null, expires_in: int}  $data
     */
    private function storeToken(array $data): string
    {
        CourierToken::query()->updateOrCreate(
            ['provider' => self::PROVIDER],
            [
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? null,
                // Refresh a little early so a token never expires mid-request.
                'expires_at' => now()->addSeconds(max(0, (int) $data['expires_in'] - 60)),
            ],
        );

        return $data['access_token'];
    }

    /**
     * @return array<string, mixed>
     */
    private function data(Response $response, string $errorMessage): array
    {
        try {
            $response->throw();
        } catch (RequestException) {
            Log::warning('Pathao API request failed', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            throw new CourierException($errorMessage.' '.$this->describeError($response));
        }

        $body = $response->json();

        return $body['data'] ?? $body ?? [];
    }

    /**
     * Turns Pathao's error response into a readable, safe-for-admins reason,
     * e.g. "store_id: Wrong Store selected". Falls back to Pathao's top-level
     * message, then the raw HTTP status, if the shape is unexpected.
     */
    private function describeError(Response $response): string
    {
        $body = $response->json();

        if (is_array($body) && isset($body['errors']) && is_array($body['errors'])) {
            $reasons = [];

            foreach ($body['errors'] as $field => $messages) {
                $reasons[] = $field.': '.implode(', ', (array) $messages);
            }

            if ($reasons !== []) {
                return '('.implode('; ', $reasons).')';
            }
        }

        if (is_array($body) && isset($body['message']) && is_string($body['message'])) {
            return '('.$body['message'].')';
        }

        return '(HTTP '.$response->status().')';
    }

    /**
     * Best-effort mapping of Pathao's status text to our internal enum.
     * Pathao's docs only show "Pending" as an example and do not enumerate
     * the full status list, so this is deliberately lenient - the raw
     * status text is always preserved for admins alongside this.
     */
    /**
     * Maps Pathao's raw order_status/order_status_slug text to our CourierStatus
     * enum. Matching is normalized (lowercased, non-alphanumeric collapsed to
     * underscores) so "At Sorting", "at_sorting", and "At_Sorting_Hub" all match
     * the same case. Anything Pathao adds that we don't recognize yet falls back
     * to Unknown and is logged, rather than silently guessing.
     */
    private function mapStatus(?string $rawStatus): CourierStatus
    {
        $normalized = trim((string) preg_replace('/[^a-z0-9]+/', '_', strtolower((string) $rawStatus)), '_');

        $status = match ($normalized) {
            '' => CourierStatus::Unknown,
            'pending' => CourierStatus::Pending,
            'at_sorting', 'at_sorting_hub' => CourierStatus::AtSorting,
            'first_mile_hub' => CourierStatus::FirstMileHub,
            'assigned_for_delivery' => CourierStatus::AssignedForDelivery,
            'at_delivery_hub' => CourierStatus::AtDeliveryHub,
            'in_transit' => CourierStatus::InTransit,
            'on_hold' => CourierStatus::OnHold,
            'reattempt_requested' => CourierStatus::ReattemptRequested,
            'delivery' => CourierStatus::Delivery,
            'partial_delivery' => CourierStatus::PartialDelivery,
            'exchange' => CourierStatus::Exchange,
            'return_requested' => CourierStatus::ReturnRequested,
            'return_at_sorting' => CourierStatus::ReturnAtSorting,
            'return_in_transit' => CourierStatus::ReturnInTransit,
            'assigned_for_return' => CourierStatus::AssignedForReturn,
            'return_to_merchant' => CourierStatus::ReturnToMerchant,
            'returned' => CourierStatus::Returned,
            'paid_return' => CourierStatus::PaidReturn,
            'returned_to_inventory', 'return_to_inventory' => CourierStatus::ReturnedToInventory,
            'reprocess_pending' => CourierStatus::ReprocessPending,
            'reprocessed' => CourierStatus::Reprocessed,
            'at_inventory' => CourierStatus::AtInventory,
            default => CourierStatus::Unknown,
        };

        if ($status === CourierStatus::Unknown && $normalized !== '') {
            Log::warning('Unrecognized Pathao order status', ['raw' => $rawStatus]);
        }

        return $status;
    }
}
