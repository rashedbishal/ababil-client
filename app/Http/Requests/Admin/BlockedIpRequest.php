<?php

namespace App\Http\Requests\Admin;

use App\Models\BlockedIp;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BlockedIpRequest extends FormRequest
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
        $blockedIp = $this->route('blocked_ip');
        $blockedIpId = $blockedIp instanceof BlockedIp ? $blockedIp->id : null;

        return [
            'ip_address' => ['required', 'ip', Rule::unique('blocked_ips', 'ip_address')->ignore($blockedIpId)],
            'reason' => ['nullable', 'string', 'max:500'],
            'expires_at' => ['nullable', 'date'],
            'is_active' => ['boolean'],
        ];
    }
}
