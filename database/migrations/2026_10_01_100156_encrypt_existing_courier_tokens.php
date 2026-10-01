<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

/**
 * Backfills courier_tokens.access_token/refresh_token to encrypted ciphertext
 * before the CourierToken model starts applying an `encrypted` cast to them,
 * so existing plaintext rows (e.g. from before this change) don't suddenly
 * fail to decrypt. Idempotent: a value that's already valid ciphertext for
 * the current APP_KEY is left untouched, so re-running this safely no-ops.
 */
return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('courier_tokens')->get() as $row) {
            DB::table('courier_tokens')->where('id', $row->id)->update([
                'access_token' => $this->encryptIfPlain($row->access_token),
                'refresh_token' => $row->refresh_token !== null ? $this->encryptIfPlain($row->refresh_token) : null,
            ]);
        }
    }

    public function down(): void
    {
        foreach (DB::table('courier_tokens')->get() as $row) {
            DB::table('courier_tokens')->where('id', $row->id)->update([
                'access_token' => $this->decryptIfEncrypted($row->access_token),
                'refresh_token' => $row->refresh_token !== null ? $this->decryptIfEncrypted($row->refresh_token) : null,
            ]);
        }
    }

    private function encryptIfPlain(string $value): string
    {
        try {
            Crypt::decryptString($value);

            // Already valid ciphertext - leave it alone.
            return $value;
        } catch (Throwable) {
            return Crypt::encryptString($value);
        }
    }

    private function decryptIfEncrypted(string $value): string
    {
        try {
            return Crypt::decryptString($value);
        } catch (Throwable) {
            // Already plaintext - leave it alone.
            return $value;
        }
    }
};
