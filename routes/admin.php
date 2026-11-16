<?php

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\BlockedIpController;
use App\Http\Controllers\Admin\CertificateController;
use App\Http\Controllers\Admin\CourierAlertController;
use App\Http\Controllers\Admin\CourierController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\HeroBannerController;
use App\Http\Controllers\Admin\IncompleteOrderController;
use App\Http\Controllers\Admin\LogoController;
use App\Http\Controllers\Admin\MetaEventLogController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\OrderCourierController;
use App\Http\Controllers\Admin\PartnerLogoController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\ProductVariantController;
use App\Http\Controllers\Admin\ReviewController;
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

    Route::scopeBindings()->group(function (): void {
        Route::post('products/{product}/images', [ProductImageController::class, 'store'])->name('products.images.store');
        Route::post('products/{product}/images/{image}', [ProductImageController::class, 'update'])->name('products.images.update');
        Route::post('products/{product}/images/{image}/move', [ProductImageController::class, 'move'])->name('products.images.move');
        Route::delete('products/{product}/images/{image}', [ProductImageController::class, 'destroy'])->name('products.images.destroy');
    });

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

    Route::post('reviews/reorder', [ReviewController::class, 'reorder'])->name('reviews.reorder');
    Route::resource('reviews', ReviewController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::get('gallery', [GalleryController::class, 'index'])->name('gallery.index');
    Route::post('gallery/sections/{section}/items', [GalleryController::class, 'store'])->name('gallery.items.store');
    Route::patch('gallery/items/{galleryItem}', [GalleryController::class, 'update'])->name('gallery.items.update');
    Route::patch('gallery/items/{galleryItem}/visibility', [GalleryController::class, 'updateVisibility'])->name('gallery.items.visibility');
    Route::post('gallery/items/{galleryItem}/move', [GalleryController::class, 'move'])->name('gallery.items.move');
    Route::delete('gallery/items/{galleryItem}', [GalleryController::class, 'destroy'])->name('gallery.items.destroy');

    Route::get('hero-banner', [HeroBannerController::class, 'index'])->name('hero-banner.index');
    Route::post('hero-banner', [HeroBannerController::class, 'store'])->name('hero-banner.store');
    Route::patch('hero-banner/{heroBannerSlide}', [HeroBannerController::class, 'update'])->name('hero-banner.update');
    Route::patch('hero-banner/{heroBannerSlide}/visibility', [HeroBannerController::class, 'updateVisibility'])->name('hero-banner.visibility');
    Route::post('hero-banner/{heroBannerSlide}/move', [HeroBannerController::class, 'move'])->name('hero-banner.move');
    Route::delete('hero-banner/{heroBannerSlide}', [HeroBannerController::class, 'destroy'])->name('hero-banner.destroy');

    Route::get('logos', [LogoController::class, 'index'])->name('logos.index');
    Route::post('logos/{slot}', [LogoController::class, 'update'])->name('logos.update');
    Route::delete('logos/{slot}', [LogoController::class, 'destroy'])->name('logos.destroy');

    Route::get('partners', [PartnerLogoController::class, 'index'])->name('partners.index');
    Route::post('partners', [PartnerLogoController::class, 'store'])->name('partners.store');
    Route::patch('partners/{partnerLogo}', [PartnerLogoController::class, 'update'])->name('partners.update');
    Route::patch('partners/{partnerLogo}/visibility', [PartnerLogoController::class, 'updateVisibility'])->name('partners.visibility');
    Route::post('partners/{partnerLogo}/move', [PartnerLogoController::class, 'move'])->name('partners.move');
    Route::delete('partners/{partnerLogo}', [PartnerLogoController::class, 'destroy'])->name('partners.destroy');

    Route::get('certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::post('certificates', [CertificateController::class, 'store'])->name('certificates.store');
    Route::patch('certificates/{certificate}', [CertificateController::class, 'update'])->name('certificates.update');
    Route::patch('certificates/{certificate}/visibility', [CertificateController::class, 'updateVisibility'])->name('certificates.visibility');
    Route::post('certificates/{certificate}/move', [CertificateController::class, 'move'])->name('certificates.move');
    Route::delete('certificates/{certificate}', [CertificateController::class, 'destroy'])->name('certificates.destroy');

    Route::get('courier', [CourierController::class, 'index'])->name('courier.index');
    Route::put('courier/default', [CourierController::class, 'setDefault'])->name('courier.default');
    Route::put('courier/pathao/store', [CourierController::class, 'selectPathaoStore'])->name('courier.pathao.store');
    Route::post('courier/pathao/stores', [CourierController::class, 'fetchPathaoStores'])->name('courier.pathao.stores');
    Route::post('courier/alert/dismiss', [CourierAlertController::class, 'dismiss'])->name('courier.alert.dismiss');
    Route::put('courier/{provider}', [CourierController::class, 'update'])
        ->whereIn('provider', ['pathao', 'steadfast', 'redx'])
        ->name('courier.update');

    Route::get('settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::patch('settings', [SettingController::class, 'update'])->name('settings.update');

    Route::get('meta-events', [MetaEventLogController::class, 'index'])->name('meta-events.index');
    Route::delete('meta-events', [MetaEventLogController::class, 'destroyAll'])->name('meta-events.destroy-all');

    Route::resource('admins', AdminUserController::class)->only(['index', 'store', 'update', 'destroy']);
});
