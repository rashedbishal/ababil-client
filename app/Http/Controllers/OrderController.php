<?php

namespace App\Http\Controllers;

use App\Actions\Orders\PlaceOrderAction;
use App\Exceptions\OrderPlacementException;
use App\Http\Requests\PlaceOrderRequest;
use App\Jobs\SendFacebookPurchaseEvent;
use App\Models\Order;
use App\Support\OrderPayload;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function confirmation(string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        return Inertia::render('order-confirmation', [
            'order' => [
                ...OrderPayload::build($order),
                'status' => $order->status->label(),
            ],
        ]);
    }

    public function store(PlaceOrderRequest $request, PlaceOrderAction $action): RedirectResponse
    {
        try {
            $order = $action->execute(
                $request->toActionData(),
                $request->ip(),
                $request->userAgent(),
            );
        } catch (OrderPlacementException $exception) {
            // Same reasoning as the success redirect below: session-based
            // error flash (`back()->withErrors()`) can't be trusted to
            // survive the redirect's follow-up GET in every browser, so
            // this message travels statelessly too, via `?order_error=` -
            // see `LandingController::show()` and its `orderError` prop.
            return redirect()->route('home', ['order_error' => $exception->getMessage()]);
        }

        // Queued (not called inline) so a slow/unreachable Graph API never
        // delays this response. _fbp/_fbc are read here, not inside the job,
        // because they're cookies on this request - the pixel's own base
        // code sets them on the customer's browser, and since the pixel
        // snippet and this backend share an origin, they ride along with
        // this same POST automatically.
        SendFacebookPurchaseEvent::dispatch(
            $order->id,
            is_string($request->cookie('_fbp')) ? $request->cookie('_fbp') : null,
            is_string($request->cookie('_fbc')) ? $request->cookie('_fbc') : null,
        );

        // The storefront shows the result in a modal on the same page rather
        // than navigating to the confirmation route above - but getting
        // there needs a second request (this redirect's own follow-up GET),
        // and Inertia's session-based flash can't be trusted to survive
        // that round trip in every browser (some in-app webviews don't
        // reliably persist the session cookie across requests). Passing the
        // order number back as a plain query param instead means
        // `LandingController::show()` can rebuild this same data itself,
        // statelessly, with no session involved - see its own handling of
        // `?placed=`, which is what the dataLayer purchase push
        // (resources/js/hooks/use-checkout-form.ts) actually reads from.
        return redirect()->route('home', ['placed' => $order->order_number]);
    }
}
