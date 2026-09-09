<?php

namespace App\Http\Middleware;

use App\Models\CashierShift;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $currentShift = null;

        if ($request->user()?->role?->value === 'cashier') {
            $shift = CashierShift::where('user_id', $request->user()->id)
                ->where('status', 'open')
                ->first();

            if ($shift) {
                $currentShift = [
                    'id' => $shift->id,
                    'opened_at' => $shift->opened_at->toIso8601String(),
                    'initial_balance' => $shift->initial_balance,
                    'current_balance' => $shift->getCurrentBalance(),
                    'total_sales' => $shift->total_sales,
                    'total_transactions' => $shift->total_transactions,
                ];
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'current_shift' => $currentShift,
        ];
    }
}
