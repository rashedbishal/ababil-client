<?php

use App\Http\Controllers\IncompleteOrderController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'show'])->name('home');

Route::get('orders/{orderNumber}/confirmation', [OrderController::class, 'confirmation'])->name('orders.confirmation');

Route::middleware(['blocked-ip'])->group(function (): void {
    Route::post('orders', [OrderController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('orders.store');

    Route::post('incomplete-orders', [IncompleteOrderController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('incomplete-orders.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
