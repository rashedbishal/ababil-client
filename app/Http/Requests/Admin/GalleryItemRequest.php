<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GalleryItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The image is required when adding an item and optional when editing
     * one (leaving it out keeps the current photo). SVG is deliberately not
     * accepted - the upload is re-encoded to WebP, and only raster formats
     * can be.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isNew = $this->route('galleryItem') === null;

        return [
            'image' => [
                $isNew ? 'required' : 'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
                'dimensions:max_width=8000,max_height=8000',
            ],
            'caption' => ['required', 'string', 'max:120'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.max' => 'The image may not be larger than 5 MB.',
            'image.mimes' => 'The image must be a JPG, PNG or WebP file.',
            'image.dimensions' => 'The image may not be larger than 8000 x 8000 pixels.',
        ];
    }
}
