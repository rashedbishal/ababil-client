<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Only identifiers and customer-supplied information are accepted here.
     * Price, subtotal, shipping charge and total are never read from the
     * request - PlaceOrderAction derives them from the database.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s]{7,20}$/'],
            'delivery_address' => ['required', 'string', 'max:1000'],
            'shipping_area_id' => ['required', 'integer', 'exists:shipping_areas,id'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
            'session_token' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * The validated input, shaped exactly as PlaceOrderAction expects it.
     *
     * @return array{
     *     product_id: int,
     *     variant_id: int|null,
     *     quantity: int,
     *     customer_name: string,
     *     customer_phone: string,
     *     delivery_address: string,
     *     shipping_area_id: int,
     *     customer_note: string|null,
     *     session_token: string|null,
     * }
     */
    public function toActionData(): array
    {
        return [
            'product_id' => $this->integer('product_id'),
            'variant_id' => $this->filled('variant_id') ? $this->integer('variant_id') : null,
            'quantity' => $this->integer('quantity'),
            'customer_name' => $this->string('customer_name')->toString(),
            'customer_phone' => $this->string('customer_phone')->toString(),
            'delivery_address' => $this->string('delivery_address')->toString(),
            'shipping_area_id' => $this->integer('shipping_area_id'),
            'customer_note' => $this->filled('customer_note') ? $this->string('customer_note')->toString() : null,
            'session_token' => $this->filled('session_token') ? $this->string('session_token')->toString() : null,
        ];
    }
}
