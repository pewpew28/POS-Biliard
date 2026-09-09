<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Models\BilliardSession;
use App\Models\CashierShift;
use Inertia\Response;

class BilliardPaymentController extends Controller
{
    public function create(BilliardSession $billiardSession): Response
    {
        abort_unless(
            CashierShift::where('user_id', request()->user()->id)->where('status', 'open')->exists(),
            422,
            'Shift belum dibuka. Silakan buka shift terlebih dahulu.',
        );

        $session = $billiardSession->load(['billiardTable', 'tableRate', 'hourlyRate', 'tablePackage']);

        abort_if($session->status !== 'open', 422, 'Sesi sudah ditutup.');

        $startedAt = $session->started_at;
        $endedAt = now();
        $durationMinutes = $session->tablePackage !== null
            ? $session->tablePackage->duration_minutes
            : (int) $startedAt->diffInMinutes($endedAt);
        $rate = $session->hourlyRate ?? $session->tableRate;
        $totalAmount = $this->calculateTotal($session, $durationMinutes);

        return inertia('cashier/pos/payment', [
            'session' => [
                'id' => $session->id,
                'customer_name' => $session->customer_name,
                'started_at' => $session->started_at->toIso8601String(),
                'ended_at' => $endedAt->toIso8601String(),
                'duration_minutes' => $durationMinutes,
                'total_amount' => $totalAmount,
                'billiard_table' => [
                    'id' => $session->billiardTable->id,
                    'name' => $session->billiardTable->name,
                    'type' => $session->billiardTable->billiardTableType->name,
                ],
                'rate' => $rate ? [
                    'id' => $rate->id,
                    'name' => $rate->name,
                    'hourly_rate' => $rate->hourly_rate,
                ] : null,
                'package' => $session->tablePackage ? [
                    'id' => $session->tablePackage->id,
                    'name' => $session->tablePackage->name,
                    'duration_minutes' => $session->tablePackage->duration_minutes,
                    'price' => $session->tablePackage->price,
                ] : null,
            ],
        ]);
    }

    private function calculateTotal(BilliardSession $session, int $durationMinutes): int
    {
        if ($session->tablePackage !== null) {
            return $session->tablePackage->price;
        }

        $rate = $session->hourlyRate ?? $session->tableRate;
        if ($rate === null) {
            return 0;
        }

        $billableMinutes = max($durationMinutes, $rate->minimum_minutes);
        $roundedMinutes = (int) (ceil($billableMinutes / $rate->rounding_minutes) * $rate->rounding_minutes);

        return (int) ceil($rate->hourly_rate * $roundedMinutes / 60);
    }
}
