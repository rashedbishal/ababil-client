<?php

namespace App\Http\Requests\Admin;

use App\Support\YouTube;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
            'youtube_url' => [
                'required',
                'string',
                'max:255',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (YouTube::extractVideoId(is_string($value) ? $value : null) === null) {
                        $fail('Enter a valid YouTube video URL.');
                    }
                },
            ],
            'is_active' => ['boolean'],
        ];
    }
}
