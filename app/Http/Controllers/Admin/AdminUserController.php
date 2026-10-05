<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $viewer = $request->user();

        // The mother admin is never listed or manageable here, even by
        // herself - her credentials are reset only via the
        // `ababil:mother-admin` CLI command.
        $admins = User::query()
            ->where('is_admin', true)
            ->where('is_mother_admin', false)
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/admins/index', [
            'viewerId' => $viewer->id,
            'admins' => $admins->through(fn (User $admin) => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'created_at' => $admin->created_at?->toIso8601String(),
            ]),
        ]);
    }

    public function store(AdminUserRequest $request): RedirectResponse
    {
        $admin = User::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
        ]);

        $admin->forceFill([
            'is_admin' => true,
            // Created directly by an admin, who is implicitly vouching for
            // them - no self-service email verification loop needed.
            'email_verified_at' => now(),
        ])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Admin account created.']);

        return back();
    }

    public function update(AdminUserRequest $request, User $admin): RedirectResponse
    {
        $this->guardAgainstManagingMotherAdmin($admin);

        $admin->update([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
        ]);

        if ($request->filled('password')) {
            $admin->update(['password' => $request->string('password')->toString()]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Admin account updated.']);

        return back();
    }

    public function destroy(Request $request, User $admin): RedirectResponse
    {
        $this->guardAgainstManagingSelfOrMotherAdmin($request, $admin);

        $admin->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Admin account removed.']);

        return back();
    }

    private function guardAgainstManagingSelfOrMotherAdmin(Request $request, User $admin): void
    {
        abort_unless($admin->is_admin, 404);
        abort_if($admin->id === $request->user()->id, 403, "You can't remove your own account.");
        abort_if($admin->is_mother_admin, 403, 'This account cannot be managed.');
    }

    private function guardAgainstManagingMotherAdmin(User $admin): void
    {
        abort_unless($admin->is_admin, 404);
        abort_if($admin->is_mother_admin, 403, 'This account cannot be managed.');
    }
}
