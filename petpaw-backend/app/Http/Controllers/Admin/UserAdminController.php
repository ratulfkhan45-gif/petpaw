<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = User::query()->latest();
        if ($r = $request->query('role')) $q->where('role', $r);
        if ($s = $request->query('status')) $q->where('status', $s);
        if ($term = $request->query('q')) {
            $q->where(fn ($w) => $w->where('name', 'like', "%$term%")->orWhere('email', 'like', "%$term%"));
        }
        $page = $q->paginate(min((int) $request->query('per_page', 20), 100));

        return response()->json([
            'users' => collect($page->items())->map(fn (User $u) => [
                'id' => 'U-'.(1000 + $u->id),
                'rawId' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'type' => User::LABELS[$u->role] ?? $u->role,
                'role' => $u->role,
                'status' => $u->status,
                'joined' => $u->created_at->toDateString(),
            ]),
            'meta' => ['page' => $page->currentPage(), 'last_page' => $page->lastPage(), 'total' => $page->total()],
        ]);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['status' => ['required', 'in:Active,Suspended']]);
        abort_if($user->id === $request->user()->id, 422, 'You cannot change your own account status.');

        $user->update($data);
        if ($data['status'] === 'Suspended') {
            $user->tokens()->delete();
        }

        return response()->json(['id' => $user->id, 'status' => $user->status]);
    }
}
