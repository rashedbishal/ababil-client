<?php

namespace App\Services\Courier;

use App\Enums\CourierStatus;

final readonly class ParcelStatus
{
    public function __construct(
        public string $consignmentId,
        public CourierStatus $status,
        public ?string $trackingCode = null,
        public ?string $rawStatus = null,
    ) {}
}
