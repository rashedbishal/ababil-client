<?php

namespace App\Exceptions;

/**
 * Thrown when the courier could not be reached at all (connection failure
 * or timeout), as opposed to answering with an error response.
 *
 * Extends CourierException so every existing best-effort catch handles it,
 * while letting callers that poll many orders in one request stop early
 * instead of waiting out the same timeout once per remaining order.
 */
class CourierUnreachableException extends CourierException {}
