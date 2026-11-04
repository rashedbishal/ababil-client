<?php

namespace App\Http\Requests\Admin;

use App\Enums\LogoSlot;
use App\Models\Logo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LogoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * The format, file size and a decoding-memory cap are enforced here. The
     * exact pixel size is not: a logo that isn't the recommended size is
     * converted by StoreLogoAction instead (the admin page warns about it).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var LogoSlot $slot */
        $slot = $this->route('slot');

        return [
            'image' => [
                'required',
                'file',
                'mimes:'.implode(',', $slot->formats()),
                'max:'.Logo::IMAGE_MAX_KB,
                'dimensions:max_width=4000,max_height=4000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        /** @var LogoSlot $slot */
        $slot = $this->route('slot');

        return [
            'image.max' => 'The image may not be larger than 1 MB.',
            'image.mimes' => 'The image must be a '.strtoupper(implode(', ', array_unique($slot->formats()))).' file.',
            'image.dimensions' => 'The image may not be larger than 4000 x 4000 pixels.',
        ];
    }
}
