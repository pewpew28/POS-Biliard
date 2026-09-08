<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\CloseBilliardSessionRequest;
use App\Http\Requests\Cashier\StoreBilliardSessionRequest;
use App\Models\BilliardSession;
use App\Models\BilliardTable;
use App\Models\HourlyRate;
use App\Models\TablePackage;
use App\Models\TableRate;
use App\Support\AuditLogger;
use DateTimeInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BilliardSessionController extends Controller
{
    public function index(): Response
    {
        return $this->renderIndex('cashier/billiard-sessions/index');
    }

    public function pos(): Response
    {
        return $this->renderIndex('cashier/pos/index');
    }

    private function renderIndex(string $page): Response
    {
        $now = now();

        return Inertia::render($page, [
            'tables' => BilliardTable::query()
                ->with(['billiardTableType', 'billiardSessions' => fn ($query) => $query->where('status', 'open')->with(['tableRate', 'tablePackage'])])
                ->orderBy('name')
                ->get()
                ->map(function (BilliardTable $table) use ($now): array {
                    $rate = $this->resolveRate($table, $now);

                    return [
                        ...$table->toArray(),
                        'effective_rate' => $rate ? [
                            'id' => $rate->id,
                            'name' => $rate->name,
                            'hourly_rate' => $rate->hourly_rate,
                            'source' => $rate instanceof HourlyRate ? 'hourly' : 'regular',
                        ] : null,
                    ];
                }),
            'sessions' => BilliardSession::query()
                ->where('status', 'open')
                ->with(['billiardTable', 'tableRate', 'hourlyRate', 'tablePackage', 'user'])
                ->latest('started_at')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cashier/billiard-sessions/create', [
            'tables' => BilliardTable::query()
                ->where('status', 'available')
                ->whereDoesntHave('billiardSessions', fn ($query) => $query->where('status', 'open'))
                ->with('billiardTableType')
                ->orderBy('name')
                ->get(),
            'rates' => TableRate::query()->where('is_active', true)->with('billiardTableType')->orderBy('name')->get(),
            'packages' => TablePackage::query()->where('is_active', true)->with('billiardTableType')->orderBy('name')->get(),
        ]);
    }

    public function store(StoreBilliardSessionRequest $request): RedirectResponse
    {
        $session = DB::transaction(function () use ($request): BilliardSession {
            $table = BilliardTable::query()->lockForUpdate()->findOrFail($request->integer('billiard_table_id'));

            abort_unless(
                $table->status === 'available' && ! $table->billiardSessions()->where('status', 'open')->exists(),
                422,
                'Meja sedang tidak tersedia.',
            );

            $rate = $request->filled('table_rate_id')
                ? TableRate::query()->whereKey($request->integer('table_rate_id'))->where('billiard_table_type_id', $table->billiard_table_type_id)->first()
                : $this->resolveRate($table, now());
            abort_unless($rate !== null, 422, 'Tarif aktif untuk meja ini belum tersedia.');

            $session = BilliardSession::create([
                'billiard_table_id' => $table->id,
                'user_id' => $request->user()->id,
                'customer_name' => $request->string('customer_name')->toString(),
                'hourly_rate_id' => $rate instanceof HourlyRate ? $rate->id : null,
                'table_rate_id' => $rate instanceof TableRate ? $rate->id : null,
                'planned_hours' => $request->integer('duration_hours') ?: 1,
                'status' => 'open',
                'started_at' => now(),
            ]);

            $table->update(['status' => 'occupied']);

            return $session->load(['billiardTable', 'tableRate', 'tablePackage']);
        });

        AuditLogger::record('created', $session, 'Membuka sesi '.$session->billiardTable->name, null, $session->toArray());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sesi meja berhasil dibuka.']);

        return to_route($request->routeIs('cashier.pos.store') ? 'cashier.pos.index' : 'cashier.billiard-sessions.index');
    }

    public function close(CloseBilliardSessionRequest $request, BilliardSession $billiardSession): RedirectResponse
    {
        abort_if($billiardSession->status !== 'open', 422, 'Sesi sudah ditutup.');

        $session = DB::transaction(function () use ($request, $billiardSession): BilliardSession {
            $session = BilliardSession::query()->lockForUpdate()->with(['billiardTable', 'tableRate', 'tablePackage'])->findOrFail($billiardSession->id);
            $endedAt = $request->date('ended_at') ?? now();
            abort_if($endedAt->lessThanOrEqualTo($session->started_at), 422, 'Waktu selesai harus setelah waktu mulai.');
            $durationMinutes = $session->planned_hours !== null
                ? $session->planned_hours * 60
                : max(1, $session->started_at->diffInMinutes($endedAt));
            $totalAmount = $this->calculateTotal($session, $durationMinutes);

            $session->update([
                'status' => 'closed',
                'ended_at' => $endedAt,
                'duration_minutes' => $durationMinutes,
                'total_amount' => $totalAmount,
                'notes' => $request->input('notes', $session->notes),
            ]);
            $session->billiardTable->update(['status' => 'available']);

            return $session->fresh(['billiardTable', 'tableRate', 'tablePackage']);
        });

        AuditLogger::record('updated', $session, 'Menutup sesi '.$session->billiardTable->name, null, $session->toArray());
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sesi meja berhasil ditutup.']);

        return to_route($request->routeIs('cashier.pos.close') ? 'cashier.pos.index' : 'cashier.billiard-sessions.index');
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

    private function resolveRate(BilliardTable $table, DateTimeInterface $at): HourlyRate|TableRate|null
    {
        $at = Carbon::instance($at);
        $time = $at->format('H:i:s');
        $day = $at->dayOfWeekIso;
        $hourlyRate = HourlyRate::query()
            ->where('billiard_table_type_id', $table->billiard_table_type_id)
            ->where('is_active', true)
            ->where(function ($query) use ($day): void {
                $query->whereNull('day_of_week')->orWhere('day_of_week', $day);
            })
            ->where('starts_at', '<=', $time)
            ->where('ends_at', '>=', $time)
            ->orderByRaw('day_of_week IS NULL')
            ->first();

        return $hourlyRate ?? TableRate::query()
            ->where('billiard_table_type_id', $table->billiard_table_type_id)
            ->where('is_active', true)
            ->orderBy('id')
            ->first();
    }
}
