<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class PlaceOrderRequest extends FormRequest
{
    /**
     * Generic, non-revealing message for both bot signals below - it never
     * hints at *why* the submission was rejected, so it teaches an
     * automated script nothing useful to adjust for.
     */
    private const BOT_REJECTION_MESSAGE = "We couldn't process your order. Please refresh the page and try again.";

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Only identifiers and customer-supplied information are accepted here.
     * Price, subtotal, shipping charge and total are never read from the
     * request - PlaceOrderAction derives them from the database.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'customer_name' => ['required', 'string', 'max:255'],
            // Matches the Bangladeshi mobile format the frontend's own
            // input pattern already enforces - the backend must not be
            // looser than what the form claims to require.
            'customer_phone' => ['required', 'string', 'regex:/^01[3-9][0-9]{8}$/'],
            'delivery_address' => ['required', 'string', 'min:10', 'max:1000'],
            'shipping_area_id' => ['required', 'integer', 'exists:shipping_areas,id'],
            'customer_note' => ['nullable', 'string', 'max:1000'],
            'session_token' => ['nullable', 'string', 'max:100'],
            'form_token' => ['required', 'string'],
            // Honeypot: real visitors never see or fill this field. Bots
            // that blindly autofill every input trip it.
            'website' => ['prohibited'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            // The honeypot's own `prohibited` rule also fails validation,
            // but under the `website` field - which the frontend never
            // displays. Surfacing it under `order` too, with the same
            // non-revealing message as the timing check below, is what
            // actually gets a real visitor (tripped by browser/extension
            // autofill, not a bot) a visible, actionable error instead of a
            // click that silently does nothing.
            if ($this->filled('website')) {
                $validator->errors()->add('order', self::BOT_REJECTION_MESSAGE);

                return;
            }

            if (! $this->filled('form_token')) {
                return;
            }

            $issuedAt = $this->decodeFormToken($this->string('form_token')->toString());

            if ($issuedAt === null) {
                $validator->errors()->add('order', self::BOT_REJECTION_MESSAGE);

                return;
            }

            $elapsedSeconds = (int) now()->timestamp - $issuedAt;

            $tooFast = $elapsedSeconds < config('orders.min_seconds_before_submit', 3);
            $tooStale = $elapsedSeconds > config('orders.max_form_token_age_hours', 6) * 3600;

            if ($tooFast || $tooStale) {
                $validator->errors()->add('order', self::BOT_REJECTION_MESSAGE);
            }
        });
    }

    private function decodeFormToken(string $token): ?int
    {
        try {
            $issuedAt = decrypt($token);
        } catch (DecryptException) {
            return null;
        }

        return is_numeric($issuedAt) ? (int) $issuedAt : null;
    }

    /**
     * The validated input, shaped exactly as PlaceOrderAction expects it.
     *
     * @return array{
     *     product_id: int,
     *     variant_id: int|null,
     *     quantity: int,
     *     customer_name: string,
     *     customer_phone: string,
     *     delivery_address: string,
     *     shipping_area_id: int,
     *     customer_note: string|null,
     *     session_token: string|null,
     * }
     */
    public function toActionData(): array
    {
        return [
            'product_id' => $this->integer('product_id'),
            'variant_id' => $this->filled('variant_id') ? $this->integer('variant_id') : null,
            'quantity' => $this->integer('quantity'),
            'customer_name' => $this->string('customer_name')->toString(),
            'customer_phone' => $this->string('customer_phone')->toString(),
            'delivery_address' => $this->string('delivery_address')->toString(),
            'shipping_area_id' => $this->integer('shipping_area_id'),
            'customer_note' => $this->filled('customer_note') ? $this->string('customer_note')->toString() : null,
            'session_token' => $this->filled('session_token') ? $this->string('session_token')->toString() : null,
        ];
    }
}
