<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class TrackIncompleteOrderRequest extends FormRequest
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
            'session_token' => ['required', 'string', 'max:100'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:50'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            // Matches PlaceOrderRequest's own rule for this field - the
            // frontend only ever debounces a tracking call once the phone
            // field already matches this exact pattern (see welcome.tsx's
            // track()), so this rejects nothing a real visitor would ever
            // send, only free-text garbage aimed directly at this endpoint.
            'customer_phone' => ['nullable', 'string', 'regex:/^01[3-9][0-9]{8}$/'],
            'delivery_address' => ['nullable', 'string', 'max:1000'],
            'shipping_area_id' => ['nullable', 'integer', 'exists:shipping_areas,id'],
        ];
    }
}
