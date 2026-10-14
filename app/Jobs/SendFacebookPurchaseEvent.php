<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\Facebook\FacebookConversionsApiService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Reports a placed order to Facebook's Conversions API, queued so a slow
 * or unreachable Graph API never delays the customer-facing checkout
 * response. Dispatched from OrderController::store() once the order is
 * committed.
 */
class SendFacebookPurchaseEvent implements ShouldQueue
{
    use Queueable;

    /**
     * A handful of attempts covers a transient network/Graph API blip;
     * a persistently failing call (e.g. a revoked token) is logged by
     * failed() below rather than retried forever.
     */
    public int $tries = 3;

    public function __construct(
        private readonly int $orderId,
        private readonly ?string $fbp = null,
        private readonly ?string $fbc = null,
    ) {}

    public function handle(FacebookConversionsApiService $service): void
    {
        $order = Order::query()->find($this->orderId);

        if ($order === null) {
            return;
        }

        $service->sendPurchaseEvent($order, $this->fbp, $this->fbc);
    }

    public function failed(Throwable $exception): void
    {
        Log::warning('Facebook Conversions API Purchase event failed permanently', [
            'order_id' => $this->orderId,
            'exception' => $exception->getMessage(),
        ]);
    }
}
