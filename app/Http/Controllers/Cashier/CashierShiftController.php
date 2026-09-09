<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\BilliardSession;
use App\Models\CashierMutation;
use App\Models\CashierShift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CashierShiftController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        // Get or create open shift for current user
        $currentShift = CashierShift::where('user_id', $user->id)
            ->where('status', 'open')
            ->with(['mutations' => fn ($q) => $q->latest()])
            ->first();

        // Get today's shifts for this user
        $todayShifts = CashierShift::where('user_id', $user->id)
            ->whereDate('opened_at', today())
            ->with('mutations')
            ->orderByDesc('opened_at')
            ->get();

        return inertia('cashier/shift/index', [
            'current_shift' => $currentShift ? [
                'id' => $currentShift->id,
                'opened_at' => $currentShift->opened_at->toIso8601String(),
                'initial_balance' => $currentShift->initial_balance,
                'current_balance' => $currentShift->getCurrentBalance(),
                'total_sales' => $currentShift->total_sales,
                'total_transactions' => $currentShift->total_transactions,
                'recent_mutations' => $currentShift->mutations->take(10)->map(fn ($m) => [
                    'id' => $m->id,
                    'type' => $m->type,
                    'amount' => $m->amount,
                    'description' => $m->description,
                    'created_at' => $m->created_at->toIso8601String(),
                ]),
            ] : null,
            'today_summary' => [
                'total_sales' => $todayShifts->sum('total_sales'),
                'total_transactions' => $todayShifts->sum('total_transactions'),
                'shifts_count' => $todayShifts->count(),
            ],
        ]);
    }

    public function open(Request $request): RedirectResponse
    {
        $user = auth()->user();

        // Check if user already has open shift
        $existingOpen = CashierShift::where('user_id', $user->id)->where('status', 'open')->exists();
        abort_if($existingOpen, 422, 'Kamu sudah punya shift yang aktif.');

        $request->validate([
            'initial_balance' => ['required', 'integer', 'min:0'],
        ]);

        $shift = CashierShift::create([
            'user_id' => $user->id,
            'opened_at' => now(),
            'initial_balance' => $request->integer('initial_balance'),
            'status' => 'open',
        ]);

        session()->flash('toast', ['type' => 'success', 'message' => 'Shift berhasil dibuka.']);

        return to_route('cashier.pos.index');
    }

    public function close(Request $request): RedirectResponse|JsonResponse
    {
        $user = auth()->user();

        $shift = CashierShift::where('user_id', $user->id)->where('status', 'open')->firstOrFail();

        $request->validate([
            'final_balance' => ['required', 'integer', 'min:0'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $shift->update([
            'closed_at' => now(),
            'final_balance' => $request->integer('final_balance'),
            'status' => 'closed',
            'notes' => $request->input('notes'),
        ]);

        // If requested as JSON (from logout modal), return shift summary
        if ($request->wantsJson() || $request->header('Accept') === 'application/json') {
            return response()->json([
                'success' => true,
                'shift' => [
                    'id' => $shift->id,
                    'opened_at' => $shift->opened_at->toIso8601String(),
                    'closed_at' => $shift->closed_at->toIso8601String(),
                    'initial_balance' => $shift->initial_balance,
                    'final_balance' => $shift->final_balance,
                    'total_sales' => $shift->total_sales,
                    'total_transactions' => $shift->total_transactions,
                    'total_mutations' => $shift->mutations()->count(),
                ],
            ]);
        }

        session()->flash('toast', ['type' => 'success', 'message' => 'Shift berhasil ditutup.']);

        return to_route('cashier.shift.index');
    }

    public function addMutation(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $shift = CashierShift::where('user_id', $user->id)->where('status', 'open')->firstOrFail();

        $request->validate([
            'type' => ['required', 'in:deposit,withdrawal,adjustment'],
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:200'],
        ]);

        $mutation = CashierMutation::create([
            'cashier_shift_id' => $shift->id,
            'type' => $request->input('type'),
            'amount' => $request->integer('amount'),
            'description' => $request->input('description'),
        ]);

        // Update shift totals
        $adjustment = $request->input('type') === 'withdrawal' ? -$mutation->amount : $mutation->amount;
        $shift->increment('total_sales', $adjustment);

        session()->flash('toast', ['type' => 'success', 'message' => 'Mutasi berhasil ditambahkan.']);

        return to_route('cashier.shift.index');
    }

    public static function recordSale(BilliardSession $session, int $amount): void
    {
        $shift = CashierShift::where('user_id', $session->user_id)->where('status', 'open')->first();

        if (! $shift) {
            return;
        }

        CashierMutation::create([
            'cashier_shift_id' => $shift->id,
            'billiard_session_id' => $session->id,
            'type' => 'sale',
            'amount' => $amount,
            'description' => "Pembayaran {$session->billiardTable->name}",
        ]);

        $shift->increment('total_sales', $amount);
        $shift->increment('total_transactions');
    }
}
