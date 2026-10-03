<?php

namespace App\Console\Commands;

use App\Concerns\PasswordValidationRules;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EnsureMotherAdminCommand extends Command
{
    use PasswordValidationRules;

    protected $signature = 'ababil:mother-admin';

    protected $description = 'Create the mother admin account, or replace its email and password if one already exists';

    public function handle(): int
    {
        $motherAdminIds = User::query()->where('is_mother_admin', true)->pluck('id');

        if ($motherAdminIds->count() > 1) {
            $this->components->error('More than one mother admin account already exists - resolve this manually before using this command.');

            return self::FAILURE;
        }

        $existingId = $motherAdminIds->first();

        $name = $existingId === null ? ($this->ask('Mother admin name', 'Admin') ?: 'Admin') : null;
        $email = $this->askForEmail($existingId);
        $password = $this->askForPassword();

        // Re-check for the mother admin inside the transaction (with a row
        // lock, if one already exists) rather than trusting the lookup
        // above, which happened before the interactive prompts - this keeps
        // the "one and only mother admin" guarantee even if something else
        // changed the row while this command was waiting on input.
        DB::transaction(function () use ($existingId, $name, $email, $password): void {
            $motherAdmin = $existingId !== null
                ? User::query()->whereKey($existingId)->lockForUpdate()->firstOrFail()
                : new User(['name' => $name]);

            $motherAdmin->forceFill([
                'email' => $email,
                'password' => $password,
                'is_admin' => true,
                'is_mother_admin' => true,
                'email_verified_at' => $motherAdmin->email_verified_at ?? now(),
            ])->save();
        });

        $this->components->info("Mother admin account ready: {$email}");

        return self::SUCCESS;
    }

    private function askForEmail(?int $ignoreUserId): string
    {
        while (true) {
            $email = (string) $this->ask('Mother admin email');

            $validator = Validator::make(['email' => $email], [
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($ignoreUserId)],
            ]);

            if ($validator->passes()) {
                return $email;
            }

            $this->components->error($validator->errors()->first('email'));
        }
    }

    private function askForPassword(): string
    {
        while (true) {
            $password = (string) $this->secret('Mother admin password');
            $confirmation = (string) $this->secret('Confirm password');

            $validator = Validator::make(
                ['password' => $password, 'password_confirmation' => $confirmation],
                ['password' => $this->passwordRules()],
            );

            if ($validator->passes()) {
                return $password;
            }

            $this->components->error($validator->errors()->first('password'));
        }
    }
}
