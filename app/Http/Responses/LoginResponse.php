<?php

namespace App\Http\Responses;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        // Cashier goes directly to POS, shift modal will show if needed
        if ($user?->role === UserRole::Cashier) {
            return redirect()->intended('/cashier/pos');
        }

        return redirect()->intended(config('fortify.home'));
    }
}
