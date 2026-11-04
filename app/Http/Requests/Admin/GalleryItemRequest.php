<?php

namespace App\Http\Requests\Admin;

use App\Models\GalleryItem;
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
     * one (leaving it out keeps the current photo). Only WebP is accepted.
     * The exact pixel size is not enforced here: a photo that isn't
     * IMAGE_SIZE x IMAGE_SIZE is converted by StoreGalleryImageAction instead
     * (the admin page warns about this). The dimension cap below only guards
     * the server's memory while decoding.
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
                'mimes:webp',
                'max:'.GalleryItem::IMAGE_MAX_KB,
                'dimensions:max_width=4000,max_height=4000',
            ],
            'caption' => ['required', 'string', 'max:'.GalleryItem::CAPTION_MAX_LENGTH],
            'is_active' => ['boolean'],
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
