<?php

namespace App\Http\Requests\Admin;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AdminUserRequest extends FormRequest
{
    use PasswordValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $admin = $this->route('admin');
        $adminId = $admin instanceof User ? $admin->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($adminId)],
            // On create a password is mandatory; on update it's optional -
            // leaving it blank keeps the admin's existing password, same
            // convention as the courier credentials form.
            'password' => $adminId === null
                ? $this->passwordRules()
                : ['nullable', 'string', Password::default(), 'confirmed'],
        ];
    }
}
