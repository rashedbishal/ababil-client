<?php

namespace App\Http\Requests\Admin;

use App\Enums\CourierStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderStatusSyncMode;
use App\Models\Order;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class OrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', new Enum(OrderStatus::class)],
            'courier_status' => ['sometimes', 'nullable', new Enum(CourierStatus::class)],
            'admin_note' => ['sometimes', 'nullable', 'string', 'max:2000'],
            // Matches PlaceOrderRequest's own rules for these same fields -
            // an admin correction shouldn't be allowed to save something
            // the original checkout form would have rejected.
            'customer_phone' => ['sometimes', 'string', 'regex:/^01[3-9][0-9]{8}$/'],
            'delivery_address' => ['sometimes', 'string', 'min:10', 'max:1000'],
            'customer_note' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $order = $this->route('order');

            if (! $order instanceof Order) {
                return;
            }

            if ($order->status_sync_mode === OrderStatusSyncMode::Automated
                && $this->filled('status')
                && $this->input('status') !== $order->status->value) {
                $validator->errors()->add(
                    'status',
                    'This order\'s status is automated and synced from the courier. Switch to manual mode to change it.',
                );
            }
        });
    }
}
