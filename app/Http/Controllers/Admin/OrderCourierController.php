<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Orders\RefreshCourierStatusAction;
use App\Actions\Orders\UpdateOrderStatusAction;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use App\Exceptions\CourierException;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Services\Courier\CourierServiceInterface;
use App\Services\Courier\ParcelData;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderCourierController extends Controller
{
    public function submit(Request $request, Order $order, CourierServiceInterface $courier): RedirectResponse
    {
        if ($order->status === OrderStatus::Cancelled) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This order is cancelled and cannot be sent to the courier.']);

            return back();
        }

        if ($order->courier_consignment_id !== null) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This order was already submitted to the courier.']);

            return back();
        }

        try {
            $parcel = $courier->createParcel(ParcelData::fromOrder($order->load('items')));
        } catch (CourierException $exception) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $exception->getMessage()]);

            return back();
        }

        $order->update([
            'courier_provider' => Setting::get('courier_default_provider'),
            'courier_consignment_id' => $parcel->consignmentId,
            'courier_tracking_code' => $parcel->trackingCode,
            'courier_status' => $parcel->status,
            'courier_raw_status' => $parcel->rawStatus,
        ]);

        if ($order->status_sync_mode === OrderStatusSyncMode::Automated
            && ($order->status === OrderStatus::Pending || $order->status === OrderStatus::Confirmed)) {
            app(UpdateOrderStatusAction::class)->execute(
                $order,
                OrderStatus::CourierSubmitted,
                $request->user(),
                'Submitted to courier.',
            );
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order submitted to the courier.']);

        return back();
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
