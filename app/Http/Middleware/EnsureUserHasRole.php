<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_unless(
            $user !== null && $user->hasAnyRole(...array_map(
                static fn (string $role): UserRole => UserRole::from($role),
                $roles,
            )),
            Response::HTTP_FORBIDDEN,
        );

        return $next($request);
    }
}
