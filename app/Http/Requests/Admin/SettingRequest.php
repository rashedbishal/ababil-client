<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SettingRequest extends FormRequest
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
            'site_name' => ['nullable', 'string', 'max:255'],
            'site_phone' => ['nullable', 'string', 'max:50'],
            'site_email' => ['nullable', 'email', 'max:255'],
            'currency' => ['nullable', 'string', 'max:10'],
            'order_prefix' => ['nullable', 'string', 'max:10', 'alpha_dash'],
            'head_code' => ['nullable', 'string', 'max:20000'],
            'body_code' => ['nullable', 'string', 'max:20000'],
            'whatsapp_number' => ['nullable', 'string', 'max:20'],
            'facebook_page_url' => ['nullable', 'url', 'max:255'],
        ];
    }
}
