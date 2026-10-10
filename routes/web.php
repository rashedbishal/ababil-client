<?php

use App\Http\Controllers\IncompleteOrderController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SiteVisitController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'show'])->name('home');

Route::get('/concept-1', [LandingController::class, 'concept1'])->name('concept-1');
Route::get('/concept-2', [LandingController::class, 'concept2'])->name('concept-2');
Route::get('/concept-3', [LandingController::class, 'concept3'])->name('concept-3');

Route::get('orders/{orderNumber}/confirmation', [OrderController::class, 'confirmation'])
    ->middleware('throttle:30,1')
    ->name('orders.confirmation');

Route::post('site-visits', [SiteVisitController::class, 'store'])
    ->middleware('throttle:30,1')
    ->name('site-visits.store');

Route::middleware(['blocked-ip'])->group(function (): void {
    Route::post('orders', [OrderController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('orders.store');

    Route::post('incomplete-orders', [IncompleteOrderController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('incomplete-orders.store');
});

Route::redirect('dashboard', '/admin')->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';
