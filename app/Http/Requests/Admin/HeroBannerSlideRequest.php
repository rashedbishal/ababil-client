<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class HeroBannerSlideRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'alt' => ['required', 'string', 'max:200'],
            'is_active' => ['sometimes', 'boolean'],
            'desktop_image' => ['nullable', 'image', 'mimes:webp', 'max:100'],
            'tab_image' => ['nullable', 'image', 'mimes:webp', 'max:80'],
            'mobile_image' => ['nullable', 'image', 'mimes:webp', 'max:50'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'desktop_image' => 'desktop image',
            'tab_image' => 'tab image',
            'mobile_image' => 'mobile image',
        ];
    }
}
