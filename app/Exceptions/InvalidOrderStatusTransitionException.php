<?php

namespace App\Exceptions;

use App\Enums\OrderStatus;
use RuntimeException;

/**
 * Thrown when an order status change would violate the fulfilment pipeline's
 * allowed-transition policy (see UpdateOrderStatusAction). The message is
 * safe to show directly to an admin.
 */
class InvalidOrderStatusTransitionException extends RuntimeException
{
    public static function terminal(OrderStatus $from): self
    {
        return new self(sprintf(
            "This order is %s, which is a final status and can't be changed further.",
            $from->label(),
        ));
    }

    public static function notAllowed(OrderStatus $from, OrderStatus $to): self
    {
        return new self(sprintf(
            'An order cannot move from %s to %s.',
            $from->label(),
            $to->label(),
        ));
    }
}
