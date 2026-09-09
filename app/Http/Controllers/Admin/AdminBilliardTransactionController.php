<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BilliardSession;
use Illuminate\Http\Request;
use Inertia\Response;

class AdminBilliardTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = BilliardSession::query()
            ->where('status', 'closed')
            ->with(['billiardTable', 'tableRate', 'hourlyRate', 'user']);

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('ended_at', '>=', $request->date('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('ended_at', '<=', $request->date('date_to'));
        }

        // Filter by cashier
        if ($request->filled('cashier_id')) {
            $query->where('user_id', $request->cashier_id);
        }

        $transactions = $query
            ->orderBy('ended_at', 'desc')
            ->limit(200)
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

        // Summary stats
        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();
        $totalMinutes = $transactions->sum('duration_minutes');

        return inertia('admin/transactions/index', [
            'transactions' => $transactions,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'total_minutes' => $totalMinutes,
            ],
        ]);
    }
}
