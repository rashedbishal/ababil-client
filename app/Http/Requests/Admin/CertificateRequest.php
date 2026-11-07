<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class CertificateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string|int|array<string, mixed>>>
     */
    public function rules(): array
    {
        $isUpdate = $this->route('certificate') !== null;

        return [
            'title' => ['required', 'string', 'max:80'],
            'subtitle' => ['nullable', 'string', 'max:140'],
            'image' => [
                $isUpdate ? 'nullable' : 'required',
                'image',
                'mimes:jpeg,png,webp',
                'max:2048',
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function passedValidation(): void
    {
        $this->merge([
            'title' => trim((string) $this->input('title')),
            'subtitle' => trim((string) ($this->input('subtitle') ?? '')) ?: null,
        ]);
    }
}
