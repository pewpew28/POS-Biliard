<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\BilliardSession;
use Inertia\Response;

class CashierBilliardTransactionController extends Controller
{
    public function index(): Response
    {
        $transactions = BilliardSession::query()
            ->where('status', 'closed')
            ->with(['billiardTable', 'tableRate', 'hourlyRate', 'user'])
            ->orderBy('ended_at', 'desc')
            ->limit(100)
            ->get()
            ->map(fn ($session) => [
                'id' => $session->id,
                'customer_name' => $session->customer_name,
                'started_at' => $session->started_at->toIso8601String(),
                'ended_at' => $session->ended_at?->toIso8601String(),
                'duration_minutes' => $session->duration_minutes,
                'total_amount' => $session->total_amount,
                'billiard_table' => [
                    'id' => $session->billiardTable->id,
                    'name' => $session->billiardTable->name,
                    'type' => $session->billiardTable->billiardTableType->name,
                ],
                'rate' => $session->hourlyRate
                    ? ['name' => $session->hourlyRate->name, 'hourly_rate' => $session->hourlyRate->hourly_rate]
                    : ($session->tableRate ? ['name' => $session->tableRate->name, 'hourly_rate' => $session->tableRate->hourly_rate] : null),
                'cashier' => [
                    'id' => $session->user->id,
                    'name' => $session->user->name,
                ],
                'created_at' => $session->created_at->toIso8601String(),
            ]);

        return inertia('cashier/pos/transactions', [
            'transactions' => $transactions,
        ]);
    }
}
