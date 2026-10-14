<?php

namespace App\Services\Facebook;

use App\Models\Order;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Sends a server-side "Purchase" event to Meta's Conversions API for a
 * placed order.
 *
 * It reuses the same event_id the storefront's browser-side pixel push
 * already sends (resources/js/lib/analytics.ts#pushPurchaseEvent, read
 * from the dataLayer by whatever Facebook Pixel tag is configured in GTM)
 * so Meta can deduplicate the browser event and this server event into a
 * single conversion instead of double-counting the sale.
 *
 * Configuration (pixel ID, access token) lives in the `settings` table,
 * set from the admin Settings page - never in .env, matching how courier
 * provider credentials are configured. The access token is encrypted at
 * rest (Setting::getEncrypted()) and never sent back to the browser.
 */
class FacebookConversionsApiService
{
    /**
     * Graph API version this integration is built against. A version bump
     * is a code change, not a per-merchant setting - unlike the pixel ID
     * and token, it isn't something an admin would ever need to edit.
     */
    private const GRAPH_API_VERSION = 'v21.0';

    /**
     * Does nothing if the pixel ID or access token hasn't been configured
     * yet on the Settings page - the Conversions API is optional, so a
     * missing setting is not an error condition.
     *
     * Lets a failed HTTP request throw (Illuminate\Http\Client\
     * RequestException) rather than swallowing it, so the caller (a queued
     * job) can retry a transient failure instead of silently losing the
     * conversion event.
     */
    public function sendPurchaseEvent(Order $order, ?string $fbp = null, ?string $fbc = null): void
    {
        $pixelId = Setting::get('facebook_pixel_id');
        $accessToken = Setting::getEncrypted('facebook_conversions_api_access_token');

        if (! $pixelId || ! $accessToken) {
            return;
        }

        $order->loadMissing('items');

        $event = [
            'event_name' => 'Purchase',
            'event_time' => $order->created_at->timestamp,
            // Matches the browser-side dataLayer push's event_id
            // (resources/js/lib/analytics.ts) so Meta's pixel and this
            // server event dedupe into one conversion.
            'event_id' => $order->order_number,
            'action_source' => 'website',
            'event_source_url' => route('home'),
            'user_data' => $this->userData($order, $fbp, $fbc),
            'custom_data' => $this->customData($order),
        ];

        // Meta's documented examples post `data` as a JSON-encoded string
        // field alongside `access_token`, not a nested JSON body - form
        // encoding here matches that shape exactly rather than guessing
        // whether the endpoint also accepts a raw JSON payload.
        Http::asForm()
            ->post('https://graph.facebook.com/'.self::GRAPH_API_VERSION."/{$pixelId}/events", [
                'access_token' => $accessToken,
                'data' => json_encode([$event]),
            ])
            ->throw();
    }

    /**
     * @return array<string, mixed>
     */
    private function userData(Order $order, ?string $fbp, ?string $fbc): array
    {
        return array_filter([
            'ph' => [$this->hash($this->normalizePhone($order->customer_phone))],
            'client_ip_address' => $order->customer_ip,
            'client_user_agent' => $order->user_agent,
            // Set by the Facebook Pixel's own base code on the customer's
            // browser (as cookies on the same origin as this backend) -
            // included here, when present, purely to improve Meta's event
            // match quality. Never generated or faked by this app.
            'fbp' => $fbp,
            'fbc' => $fbc,
        ], fn ($value) => $value !== null);
    }

    /**
     * @return array<string, mixed>
     */
    private function customData(Order $order): array
    {
        return [
            'currency' => Setting::get('currency', 'BDT'),
            'value' => (float) $order->grand_total,
            'content_type' => 'product',
            'contents' => $order->items->map(fn ($item) => [
                'id' => $item->sku ?? (string) $item->product_id,
                'quantity' => $item->quantity,
                'item_price' => (float) $item->unit_price,
            ])->all(),
        ];
    }

    /**
     * Meta requires hashed phone numbers to be digits-only, with the
     * country code and no leading zero. Bangladeshi numbers are collected
     * in local format (01XXXXXXXXX, enforced by PlaceOrderRequest), so the
     * leading 0 is swapped for the country code (880) here.
     */
    private function normalizePhone(string $phone): string
    {
        $digits = (string) preg_replace('/\D/', '', $phone);

        return Str::startsWith($digits, '0') ? '880'.substr($digits, 1) : $digits;
    }

    private function hash(string $value): string
    {
        return hash('sha256', strtolower(trim($value)));
    }
}
