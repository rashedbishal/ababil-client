<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Orders\RefreshCourierStatusAction;
use App\Actions\Orders\UpdateOrderStatusAction;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use App\Exceptions\CourierException;
use App\Exceptions\InvalidOrderStatusTransitionException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Services\Courier\CourierServiceInterface;
use App\Services\Courier\ParcelData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderCourierController extends Controller
{
    public function submit(Request $request, Order $order, CourierServiceInterface $courier): RedirectResponse
    {
        // Serializes submission attempts for this order so two rapid
        // concurrent requests can't both observe "not yet submitted" and
        // both create a Pathao parcel. Deliberately an application-level
        // lock rather than holding a `lockForUpdate()` transaction open for
        // the duration of this method: the Pathao call below is a slow
        // external HTTP request, and holding a DB row lock across it would
        // block every other operation on this order (viewing it, refreshing
        // its courier status, changing its status) for as long as Pathao
        // takes to respond. A non-blocking lock lets a second request fail
        // fast instead of queuing behind the first or racing it. 60s
        // comfortably covers a single Pathao call with room to spare, and
        // auto-expires so a crash mid-request can't wedge the order.
        $lock = Cache::lock("order:{$order->id}:courier-submit", 60);

        if (! $lock->get()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This order is already being submitted to the courier.']);

            return back();
        }

        try {
            // Re-read and lock the row fresh now that we hold the
            // submission lock too, rather than trusting the (possibly
            // stale) $order passed in. This transaction only reads and
            // commits immediately - it never spans the Pathao call below.
            $current = DB::transaction(fn () => Order::query()->lockForUpdate()->findOrFail($order->id));

            if ($current->status === OrderStatus::Cancelled) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'This order is cancelled and cannot be sent to the courier.']);

                return back();
            }

            if ($current->courier_consignment_id !== null) {
                Inertia::flash('toast', ['type' => 'error', 'message' => 'This order was already submitted to the courier.']);

                return back();
            }

            try {
                $parcel = $courier->createParcel(ParcelData::fromOrder($current->load('items')));
            } catch (CourierException $exception) {
                Inertia::flash('toast', ['type' => 'error', 'message' => $exception->getMessage()]);

                return back();
            }

            $current->update([
                'courier_provider' => Setting::get('courier_default_provider'),
                'courier_consignment_id' => $parcel->consignmentId,
                'courier_tracking_code' => $parcel->trackingCode,
                'courier_status' => $parcel->status,
                'courier_raw_status' => $parcel->rawStatus,
            ]);

            if ($current->status_sync_mode === OrderStatusSyncMode::Automated
                && ($current->status === OrderStatus::Pending || $current->status === OrderStatus::Confirmed)) {
                try {
                    app(UpdateOrderStatusAction::class)->execute(
                        $current,
                        OrderStatus::CourierSubmitted,
                        $request->user(),
                        'Submitted to courier.',
                    );
                } catch (InvalidOrderStatusTransitionException $exception) {
                    Inertia::flash('toast', ['type' => 'error', 'message' => $exception->getMessage()]);

                    return back();
                }
            }

            Inertia::flash('toast', ['type' => 'success', 'message' => 'Order submitted to the courier.']);

            return back();
        } finally {
            $lock->release();
        }
    }

    public function refresh(Request $request, Order $order, RefreshCourierStatusAction $action): RedirectResponse
    {
        if ($order->status === OrderStatus::Cancelled) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This order is cancelled.']);

            return back();
        }

        if ($order->courier_consignment_id === null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This order has not been submitted to a courier yet.']);

            return back();
        }

        try {
            $action->execute($order, $request->user());
        } catch (CourierException $exception) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $exception->getMessage()]);

            return back();
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Courier status refreshed.']);

        return back();
    }
}
