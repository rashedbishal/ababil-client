<?php

namespace App\Http\Requests\Admin;

use App\Models\BlockedIp;
use App\Support\IpAddress;
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
     * Normalizes the submitted IP before it's validated/compared, so two
     * textual representations of the same address (e.g. a compressed vs.
     * expanded IPv6 literal) are always treated and stored as one entry.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('ip_address') && is_string($this->input('ip_address'))) {
            $this->merge(['ip_address' => IpAddress::normalize($this->input('ip_address'))]);
        }
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
