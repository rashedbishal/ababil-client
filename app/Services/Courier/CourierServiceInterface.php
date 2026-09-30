<?php

namespace App\Services\Courier;

/**
 * Contract every courier provider integration must implement.
 *
 * Provider-specific implementations (Pathao, Steadfast, RedX, ...) should be
 * added only once real API documentation and credentials are available for
 * that provider. Until then, `NullCourierService` backs this contract so the
 * rest of the application can depend on it safely.
 */
interface CourierServiceInterface
{
    /**
     * Create a parcel/consignment with the courier for the given order.
     */
    public function createParcel(ParcelData $parcel): ParcelStatus;

    /**
     * Fetch the current courier-side status of a previously created parcel.
     */
    public function getParcelStatus(string $consignmentId): ParcelStatus;

    /**
     * Cancel a previously created parcel, if the provider supports it.
     */
    public function cancelParcel(string $consignmentId): bool;
}
