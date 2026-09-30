<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when an order cannot be placed because the request no longer
 * matches reality (product/variant inactive, insufficient stock, etc).
 * The message is safe to show directly to the customer.
 */
class OrderPlacementException extends RuntimeException {}
