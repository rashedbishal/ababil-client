<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\IncompleteOrder;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $statusCounts = Order::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $revenue = Order::query()
            ->whereIn('status', array_map(fn (OrderStatus $s) => $s->value, [OrderStatus::Delivered]))
            ->sum('grand_total');

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_orders' => Order::query()->count(),
                'todays_orders' => Order::query()->whereDate('created_at', today())->count(),
                'pending_orders' => (int) ($statusCounts[OrderStatus::Pending->value] ?? 0),
                'confirmed_orders' => (int) ($statusCounts[OrderStatus::Confirmed->value] ?? 0),
                'processing_orders' => (int) ($statusCounts[OrderStatus::Processing->value] ?? 0),
                'delivered_orders' => (int) ($statusCounts[OrderStatus::Delivered->value] ?? 0),
                'cancelled_orders' => (int) ($statusCounts[OrderStatus::Cancelled->value] ?? 0),
                'incomplete_orders' => IncompleteOrder::query()->where('conversion_status', 'pending')->count(),
                'total_revenue' => (string) $revenue,
            ],
            'recentOrders' => Order::query()
                ->latest()
                ->limit(10)
                ->get(['id', 'order_number', 'customer_name', 'status', 'grand_total', 'created_at'])
                ->map(fn (Order $order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'status' => $order->status->label(),
                    'grand_total' => (string) $order->grand_total,
                    'created_at' => $order->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
