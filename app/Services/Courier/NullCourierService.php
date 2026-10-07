<?php

namespace App\Services\Courier;

use App\Exceptions\CourierException;

/**
 * Default courier implementation used while no real provider is configured.
 *
 * Keeps the rest of the application (queues, admin actions, order flow)
 * working against `CourierServiceInterface` without depending on a specific
 * provider's API before one is actually integrated.
 */
class NullCourierService implements CourierServiceInterface
{
    private const NOT_CONFIGURED_MESSAGE = 'No courier provider is configured. Set one as the default on the admin Courier Integration page.';

    public function createParcel(ParcelData $parcel): ParcelStatus
    {
        throw new CourierException(self::NOT_CONFIGURED_MESSAGE);
    }

    public function getParcelStatus(string $consignmentId): ParcelStatus
    {
        throw new CourierException(self::NOT_CONFIGURED_MESSAGE);
    }

    public function cancelParcel(string $consignmentId): bool
    {
        throw new CourierException(self::NOT_CONFIGURED_MESSAGE);
    }
}
