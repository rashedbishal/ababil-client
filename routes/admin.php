<?php

use App\Http\Controllers\Admin\BlockedIpController;
use App\Http\Controllers\Admin\CourierController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\IncompleteOrderController;
use App\Http\Controllers\Admin\MediaController;
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

    Route::post('products/{product}/variants', [ProductVariantController::class, 'store'])->name('products.variants.store');
    Route::patch('products/{product}/variants/{variant}', [ProductVariantController::class, 'update'])->name('products.variants.update');
    Route::delete('products/{product}/variants/{variant}', [ProductVariantController::class, 'destroy'])->name('products.variants.destroy');

    Route::resource('sizes', SizeController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('orders', OrderController::class)->only(['index', 'show', 'update']);
    Route::patch('orders/{order}/status-sync-mode', [OrderController::class, 'updateStatusSyncMode'])->name('orders.status-sync-mode');
    Route::post('orders/{order}/courier/submit', [OrderCourierController::class, 'submit'])->name('orders.courier.submit');
    Route::post('orders/{order}/courier/refresh', [OrderCourierController::class, 'refresh'])->name('orders.courier.refresh');

    Route::get('incomplete-orders', [IncompleteOrderController::class, 'index'])->name('incomplete-orders.index');

    Route::resource('blocked-ips', BlockedIpController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('shipping-areas', ShippingAreaController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('courier', [CourierController::class, 'index'])->name('courier.index');
    Route::put('courier/default', [CourierController::class, 'setDefault'])->name('courier.default');
    Route::put('courier/pathao/store', [CourierController::class, 'selectPathaoStore'])->name('courier.pathao.store');
    Route::post('courier/pathao/stores', [CourierController::class, 'fetchPathaoStores'])->name('courier.pathao.stores');
    Route::put('courier/{provider}', [CourierController::class, 'update'])
        ->whereIn('provider', ['pathao', 'steadfast', 'redx'])
        ->name('courier.update');

    Route::resource('media', MediaController::class)->parameters(['media' => 'media'])->only(['index', 'store', 'destroy']);

    Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::patch('settings', [SettingController::class, 'update'])->name('settings.update');
});
