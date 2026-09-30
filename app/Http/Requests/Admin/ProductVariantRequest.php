<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductVariantRequest extends FormRequest
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
        $variant = $this->route('variant');
        $variantId = $variant instanceof ProductVariant ? $variant->id : null;

        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->id : null;

        return [
            'size_id' => [
                'nullable',
                'integer',
                'exists:sizes,id',
                Rule::unique('product_variants')->where('product_id', $productId)->ignore($variantId),
            ],
            'sku' => ['required', 'string', 'max:100', Rule::unique('product_variants', 'sku')->ignore($variantId)],
            'price_override' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ];
    }
}
