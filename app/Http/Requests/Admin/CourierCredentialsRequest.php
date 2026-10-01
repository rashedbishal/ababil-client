<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourierCredentialsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Every field is optional: a blank value means "leave the currently
     * saved value unchanged" (see CourierProvider::mergeCredentials()).
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [];

        foreach ($this->fieldDefinitions() as $key => $field) {
            $rules[$key] = isset($field['options'])
                ? ['nullable', Rule::in(array_column($field['options'], 'value'))]
                : ['nullable', 'string', 'max:255'];
        }

        return $rules;
    }

    /**
     * @return array<string, array{label: string, secret: bool, options?: array<int, array{value: string, label: string}>}>
     */
    private function fieldDefinitions(): array
    {
        return config('courier.providers.'.$this->route('provider').'.fields', []);
    }
}
