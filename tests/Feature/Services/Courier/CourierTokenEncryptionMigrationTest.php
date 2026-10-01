<?php

use App\Models\CourierToken;
use Illuminate\Support\Facades\DB;

/**
 * The encrypt_existing_courier_tokens migration already runs as part of
 * every test's RefreshDatabase migrate - but against an empty table, so it
 * never actually exercises its backfill logic in the suite. These tests
 * insert a raw plaintext row the same way an old, pre-encryption deployment
 * would have, then re-run that migration's up() directly to prove existing
 * plaintext rows survive the upgrade instead of becoming unreadable.
 */
function runCourierTokenEncryptionMigration(): void
{
    $migration = require database_path('migrations/2026_10_01_100156_encrypt_existing_courier_tokens.php');
    $migration->up();
}

test('a pre-existing plaintext courier token is backfilled to ciphertext and stays readable', function () {
    DB::table('courier_tokens')->insert([
        'provider' => 'pathao',
        'access_token' => 'legacy-plaintext-access-token',
        'refresh_token' => 'legacy-plaintext-refresh-token',
        'expires_at' => now()->addDay(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    runCourierTokenEncryptionMigration();

    $raw = DB::table('courier_tokens')->where('provider', 'pathao')->first();
    expect($raw->access_token)->not->toContain('legacy-plaintext-access-token')
        ->and($raw->refresh_token)->not->toContain('legacy-plaintext-refresh-token');

    $token = CourierToken::query()->where('provider', 'pathao')->first();
    expect($token->access_token)->toBe('legacy-plaintext-access-token')
        ->and($token->refresh_token)->toBe('legacy-plaintext-refresh-token');
});

test('running the backfill migration twice does not double-encrypt a token', function () {
    DB::table('courier_tokens')->insert([
        'provider' => 'pathao',
        'access_token' => 'legacy-plaintext-access-token',
        'refresh_token' => null,
        'expires_at' => now()->addDay(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    runCourierTokenEncryptionMigration();
    runCourierTokenEncryptionMigration();

    expect(CourierToken::query()->where('provider', 'pathao')->first()->access_token)
        ->toBe('legacy-plaintext-access-token');
});

test('a token with no refresh token backfills cleanly', function () {
    DB::table('courier_tokens')->insert([
        'provider' => 'pathao',
        'access_token' => 'legacy-plaintext-access-token',
        'refresh_token' => null,
        'expires_at' => now()->addDay(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    runCourierTokenEncryptionMigration();

    expect(CourierToken::query()->where('provider', 'pathao')->first()->refresh_token)->toBeNull();
});
