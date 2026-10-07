<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\BlockedIpController;
use App\Http\Controllers\Admin\CourierController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IncompleteOrderController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrderCourierController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShippingAreaController;
use App\Http\Controllers\Admin\SizeController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('products', ProductController::class)
        ->except(['show'])
        ->middlewareFor(['create', 'store'], 'product-creation-unlocked');
    Route::post('products/{product}/restore', [ProductController::class, 'restore'])->name('products.restore');

    Route::middleware('size-management-enabled')->group(function (): void {
        Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('products.variants.store');
        Route::patch('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('products.variants.update');
        Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('products.variants.destroy');

        Route::resource('sizes', SizeController::class)->only(['index', 'store', 'update', 'destroy']);
    });

    // Must come before the orders resource below, or GET orders/{order}
    // (show) would swallow this as a request for an order with id "trashed".
    Route::get('orders/trashed', [OrderController::class, 'trashed'])->name('orders.trashed');
    Route::delete('orders/trashed', [OrderController::class, 'clearTrash'])->name('orders.clear-trash');
    Route::post('orders/trashed/{order}/restore', [OrderController::class, 'restore'])->name('orders.restore');
    Route::delete('orders/trashed/{order}', [OrderController::class, 'forceDelete'])->name('orders.force-delete');

    Route::resource('orders', OrderController::class)->only(['index', 'show', 'update', 'destroy']);
    Route::patch('orders/{order}/status-sync-mode', [OrderController::class, 'updateStatusSyncMode'])->name('orders.status-sync-mode');
    Route::post('orders/{order}/courier/submit', [OrderCourierController::class, 'submit'])->name('orders.courier.submit');
    Route::post('orders/{order}/courier/refresh', [OrderCourierController::class, 'refresh'])->name('orders.courier.refresh');

    Route::get('incomplete-orders', [IncompleteOrderController::class, 'index'])->name('incomplete-orders.index');
    Route::post('incomplete-orders/{incompleteOrder}/convert', [IncompleteOrderController::class, 'convert'])->name('incomplete-orders.convert');
    Route::delete('incomplete-orders/{incompleteOrder}', [IncompleteOrderController::class, 'destroy'])->name('incomplete-orders.destroy');

    Route::resource('blocked-ips', BlockedIpController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('shipping-areas', ShippingAreaController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('courier', [CourierController::class, 'index'])->name('courier.index');
    Route::put('courier/default', [CourierController::class, 'setDefault'])->name('courier.default');
    Route::put('courier/pathao/store', [CourierController::class, 'selectPathaoStore'])->name('courier.pathao.store');
    Route::post('courier/pathao/stores', [CourierController::class, 'fetchPathaoStores'])->name('courier.pathao.stores');
    Route::put('courier/{provider}', [CourierController::class, 'update'])
        ->whereIn('provider', ['pathao', 'steadfast', 'redx'])
        ->name('courier.update');

    Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::patch('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::resource('admins', AdminUserController::class)->only(['index', 'store', 'update', 'destroy']);
});
