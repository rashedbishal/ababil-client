<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\IncompleteOrder;
use App\Models\Order;
use App\Models\Product;
use App\Models\SiteVisit;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $request->validate([
            'from' => ['sometimes', 'nullable', 'date'],
            'to' => ['sometimes', 'nullable', 'date'],
        ]);

        $statusCounts = Order::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $revenue = Order::query()
            ->where('status', OrderStatus::Delivered)
            ->sum('grand_total');

        [$rangeFrom, $rangeTo] = $this->resolveRange($request);
        $rangeQuery = fn () => Order::query()->whereBetween('created_at', [$rangeFrom, $rangeTo]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_orders' => Order::query()->count(),
                'todays_orders' => Order::query()->whereDate('created_at', today())->count(),
                'todays_visitors' => SiteVisit::query()->whereDate('visited_on', today())->count(),
                'total_products' => Product::query()->count(),
                'pending_orders' => (int) ($statusCounts[OrderStatus::Pending->value] ?? 0),
                'confirmed_orders' => (int) ($statusCounts[OrderStatus::Confirmed->value] ?? 0),
                'courier_submitted_orders' => (int) ($statusCounts[OrderStatus::CourierSubmitted->value] ?? 0),
                'delivered_orders' => (int) ($statusCounts[OrderStatus::Delivered->value] ?? 0),
                'cancelled_orders' => (int) ($statusCounts[OrderStatus::Cancelled->value] ?? 0),
                'trashed_orders' => Order::onlyTrashed()->count(),
                'incomplete_orders' => IncompleteOrder::query()->where('conversion_status', 'pending')->count(),
                'total_revenue' => $this->formatMoney($revenue),
            ],
            'range' => [
                'from' => $rangeFrom->toDateString(),
                'to' => $rangeTo->toDateString(),
                'order_count' => $rangeQuery()->count(),
                'order_total' => $this->formatMoney($rangeQuery()->sum('grand_total')),
                // Of the orders placed in this range, how much has actually
                // been collected - only orders that reached Delivered count.
                'amount_received' => $this->formatMoney($rangeQuery()->where('status', OrderStatus::Delivered)->sum('grand_total')),
            ],
            'series' => $this->buildSeries($rangeFrom, $rangeTo),
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

    /**
     * Daily order/delivery/revenue counts for the selected range, one entry
     * per calendar day (zero-filled where no orders fell on that day) so the
     * frontend can plot a continuous line without gaps.
     *
     * @return list<array{date: string, orders: int, delivered: int, revenue: float}>
     */
    private function buildSeries(Carbon $from, Carbon $to): array
    {
        // One grouped query instead of three separate ones over the same
        // date range - the conditional SUM/COUNT below compute the
        // delivered-only counts/revenue in the same pass as the plain
        // per-day order count.
        $rowsByDay = Order::query()
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw(
                'DATE(created_at) as date, '.
                'COUNT(*) as orders, '.
                'SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as delivered, '.
                'SUM(CASE WHEN status = ? THEN grand_total ELSE 0 END) as revenue',
                [OrderStatus::Delivered->value, OrderStatus::Delivered->value],
            )
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $series = [];
        foreach (CarbonPeriod::create($from->copy()->startOfDay(), $to->copy()->startOfDay()) as $day) {
            $key = $day->toDateString();
            $row = $rowsByDay->get($key);
            $series[] = [
                'date' => $key,
                'orders' => (int) ($row->orders ?? 0),
                'delivered' => (int) ($row->delivered ?? 0),
                'revenue' => (float) ($row->revenue ?? 0),
            ];
        }

        return $series;
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $from = Carbon::parse($request->date('from') ?? now()->subDays(29))->startOfDay();
        $to = Carbon::parse($request->date('to') ?? now())->endOfDay();

        return [$from, $to];
    }

    /**
     * Query builder sum() aggregates come back as a driver-dependent
     * int/float/string (e.g. "300" instead of "300.00"), losing the
     * decimal(10,2) column's precision - format it explicitly.
     */
    private function formatMoney(int|float|string|null $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
