<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a courier provider request fails or is not supported.
 * The message is safe to show directly to an admin.
 */
class CourierException extends RuntimeException {}
