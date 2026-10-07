<?php

use App\Actions\Orders\UpdateOrderStatusAction;
use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderStatusTransitionException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;

test('cancelling an order restores the product stock', function () {
    $admin = $this->actingAsAdmin();
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 7]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->for($order)->for($product)->create(['variant_id' => null, 'quantity' => 3]);

    app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin);

    expect($product->fresh()->stock)->toBe(10)
        ->and($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});

test('cancelling an order restores the variant stock', function () {
    $admin = $this->actingAsAdmin();
    $product = Product::factory()->create();
    $size = Size::factory()->create();
    $variant = ProductVariant::factory()->for($product)->for($size)->create(['stock' => 4]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->for($order)->for($product)->create(['variant_id' => $variant->id, 'quantity' => 2]);

    app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin);

    expect($variant->fresh()->stock)->toBe(6);
});

test('cancelling an order with multiple items restores each item correctly', function () {
    $admin = $this->actingAsAdmin();
    $productA = Product::factory()->create(['track_stock' => true, 'stock' => 5]);
    $productB = Product::factory()->create(['track_stock' => true, 'stock' => 1]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->for($order)->for($productA)->create(['variant_id' => null, 'quantity' => 2]);
    OrderItem::factory()->for($order)->for($productB)->create(['variant_id' => null, 'quantity' => 4]);

    app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin);

    expect($productA->fresh()->stock)->toBe(7)
        ->and($productB->fresh()->stock)->toBe(5);
});

test('cancelling an order whose variant was since hard-deleted does not incorrectly inflate the product stock', function () {
    $admin = $this->actingAsAdmin();
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 3]);
    $size = Size::factory()->create();
    $variant = ProductVariant::factory()->for($product)->for($size)->create(['stock' => 5]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->for($order)->for($product)->create([
        'variant_id' => $variant->id,
        'size_name' => $size->name,
        'quantity' => 2,
    ]);

    // Simulates the variant being hard-deleted after the order was placed:
    // order_items.variant_id is nullOnDelete(), so this is exactly what the
    // row looks like afterward.
    $variant->delete();
    $order->items->first()->refresh();

    app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin);

    expect($product->fresh()->stock)->toBe(3);
});

test('a product with stock tracking disabled is not restored', function () {
    $admin = $this->actingAsAdmin();
    $product = Product::factory()->create(['track_stock' => false, 'stock' => 0]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->for($order)->for($product)->create(['variant_id' => null, 'quantity' => 2]);

    app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin);

    expect($product->fresh()->stock)->toBe(0);
});

test('cancelling an order whose product was since discontinued still restores its stock', function () {
    $admin = $this->actingAsAdmin();
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 3]);
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);
    OrderItem::factory()->for($order)->for($product)->create(['variant_id' => null, 'quantity' => 1]);
    $product->delete();

    app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin);

    expect($product->fresh()->stock)->toBe(4);
});

test('re-saving an order without changing its already-cancelled status does not throw or restore stock again', function () {
    $admin = $this->actingAsAdmin();
    $product = Product::factory()->create(['track_stock' => true, 'stock' => 5]);
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);
    OrderItem::factory()->for($order)->for($product)->create(['variant_id' => null, 'quantity' => 2]);

    $result = app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin, 'no-op resave');

    expect($result->status)->toBe(OrderStatus::Cancelled)
        ->and($product->fresh()->stock)->toBe(5);
});

test('a cancelled order cannot be moved to any other status', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled]);

    expect(fn () => app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Shipped, $admin))
        ->toThrow(InvalidOrderStatusTransitionException::class);

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});

test('a returned order cannot be moved to any other status', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Returned]);

    expect(fn () => app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Delivered, $admin))
        ->toThrow(InvalidOrderStatusTransitionException::class);
});

test('an order cannot move backward in the fulfilment pipeline', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Shipped]);

    expect(fn () => app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Confirmed, $admin))
        ->toThrow(InvalidOrderStatusTransitionException::class);
});

test('a delivered order cannot be cancelled', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    expect(fn () => app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Cancelled, $admin))
        ->toThrow(InvalidOrderStatusTransitionException::class);
});

test('a pending order cannot be marked returned', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    expect(fn () => app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Returned, $admin))
        ->toThrow(InvalidOrderStatusTransitionException::class);
});

test('a delivered order can be marked returned', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Delivered]);

    $result = app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Returned, $admin);

    expect($result->status)->toBe(OrderStatus::Returned);
});

test('an order can skip pipeline stages moving forward', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $result = app(UpdateOrderStatusAction::class)->execute($order, OrderStatus::Delivered, $admin);

    expect($result->status)->toBe(OrderStatus::Delivered);
});

test('wouldAllow previews a transition without applying it', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Shipped]);

    $action = app(UpdateOrderStatusAction::class);

    expect($action->wouldAllow(OrderStatus::Shipped, OrderStatus::Delivered))->toBeTrue()
        ->and($action->wouldAllow(OrderStatus::Shipped, OrderStatus::Confirmed))->toBeFalse()
        ->and($action->wouldAllow(OrderStatus::Cancelled, OrderStatus::Shipped))->toBeFalse()
        ->and($action->wouldAllow(OrderStatus::Shipped, OrderStatus::Shipped))->toBeTrue()
        ->and($order->fresh()->status)->toBe(OrderStatus::Shipped);
});

test('the admin order update endpoint returns a validation error instead of a 500 for an invalid transition', function () {
    $admin = $this->actingAsAdmin();
    $order = Order::factory()->create(['status' => OrderStatus::Cancelled, 'status_sync_mode' => 'manual']);

    $response = $this->patch(route('admin.orders.update', $order), [
        'status' => OrderStatus::Shipped->value,
    ]);

    $response->assertSessionHasErrors('status');
    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled);
});
