<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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

        foreach (array_keys($this->fieldDefinitions()) as $key) {
            $rules[$key] = ['nullable', 'string', 'max:255'];
        }

        return $rules;
    }

    /**
     * @return array<string, array{label: string, secret: bool}>
     */
    private function fieldDefinitions(): array
    {
        return config('courier.providers.'.$this->route('provider').'.fields', []);
    }
}
