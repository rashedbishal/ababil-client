<?php

namespace App\Http\Requests\Admin;

use App\Enums\CourierStatus;
use App\Enums\OrderStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

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
        ];
    }
}
