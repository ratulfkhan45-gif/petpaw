<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (! $user || $user->status !== 'Active') {
            return response()->json(['message' => 'Your account is not active.'], 403);
        }
        if ($roles && ! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'You do not have access to this resource.'], 403);
        }

        return $next($request);
    }
}
