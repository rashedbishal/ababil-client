<?php

namespace App\Http\Requests\Admin;

use App\Models\PartnerLogo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PartnerLogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The image is required when adding a logo and optional when editing one
     * (leaving it out keeps the current image). The exact pixel size isn't
     * enforced: a logo of another size is converted by StoreLogoAction (the
     * admin page warns about it).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isNew = $this->route('partnerLogo') === null;

        return [
            'image' => [
                $isNew ? 'required' : 'nullable',
                'file',
                'mimes:webp,png,jpg,jpeg',
                'max:'.PartnerLogo::IMAGE_MAX_KB,
                'dimensions:max_width=4000,max_height=4000',
            ],
            'label' => ['required', 'string', 'max:'.PartnerLogo::LABEL_MAX_LENGTH],
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
            'image.mimes' => 'The image must be a WebP, PNG or JPG file.',
            'image.dimensions' => 'The image may not be larger than 4000 x 4000 pixels.',
        ];
    }
}
