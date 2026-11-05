<?php

namespace App\Http\Requests\Admin;

use App\Models\ProductImage;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Only WebP is accepted. The exact pixel size is not enforced here: a
     * photo that isn't IMAGE_SIZE x IMAGE_SIZE is converted by
     * StoreProductImageAction instead (the admin page warns about this). The
     * dimension cap below only guards the server's memory while decoding.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'file',
                'mimes:webp',
                'max:'.ProductImage::IMAGE_MAX_KB,
                'dimensions:max_width=4000,max_height=4000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.max' => 'The image may not be larger than 1 MB.',
            'image.mimes' => 'The image must be a WebP file.',
            'image.dimensions' => 'The image may not be larger than 4000 x 4000 pixels.',
        ];
    }
}
