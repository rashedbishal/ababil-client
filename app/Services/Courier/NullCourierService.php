<?php

namespace App\Services\Courier;

use RuntimeException;

/**
 * Default courier implementation used while no real provider is configured.
 *
 * Keeps the rest of the application (queues, admin actions, order flow)
 * working against `CourierServiceInterface` without depending on a specific
 * provider's API before one is actually integrated.
 */
class NullCourierService implements CourierServiceInterface
{
    public function createParcel(ParcelData $parcel): ParcelStatus
    {
        throw new RuntimeException('No courier provider is configured. Set COURIER_DEFAULT in .env once a provider integration is added.');
    }

    public function getParcelStatus(string $consignmentId): ParcelStatus
    {
        throw new RuntimeException('No courier provider is configured. Set COURIER_DEFAULT in .env once a provider integration is added.');
    }

    public function cancelParcel(string $consignmentId): bool
    {
        throw new RuntimeException('No courier provider is configured. Set COURIER_DEFAULT in .env once a provider integration is added.');
    }
}
