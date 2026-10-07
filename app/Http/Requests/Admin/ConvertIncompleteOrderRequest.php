<?php

namespace App\Http\Requests\Admin;

use App\Rules\NoUrl;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ConvertIncompleteOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The address rule matches PlaceOrderRequest's own rule for this same
     * field exactly - an admin completing a customer's order on their
     * behalf shouldn't be allowed to save an address the original checkout
     * form would have rejected.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:255'],
            'delivery_address' => ['required', 'string', 'min:10', 'max:200', new NoUrl],
        ];
    }
}
