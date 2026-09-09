<?php

namespace App\Http\Controllers\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cashier\CloseBilliardSessionRequest;
use App\Http\Requests\Cashier\StoreBilliardSessionRequest;
use App\Models\BilliardSession;
use App\Models\BilliardTable;
use App\Models\CashierShift;
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

        $tables = BilliardTable::query()
            ->with(['billiardTableType', 'billiardSessions' => fn ($query) => $query->where('status', 'open')->with(['billiardTable', 'tableRate', 'hourlyRate', 'tablePackage', 'user'])])
            ->orderBy('name')
            ->get()
            ->map(function (BilliardTable $table) use ($now): array {
                $rate = $this->resolveRate($table, $now);
                $sessions = $table->billiardSessions->map(fn ($s) => $this->mapSession($s));

                return [
                    'id' => $table->id,
                    'name' => $table->name,
                    'status' => $table->status,
                    'billiard_table_type' => [
                        'id' => $table->billiardTableType->id,
                        'name' => $table->billiardTableType->name,
                    ],
                    'billiard_sessions' => $sessions,
                    'effective_rate' => $rate ? [
                        'id' => $rate->id,
                        'name' => $rate->name,
                        'hourly_rate' => $rate->hourly_rate,
                        'source' => $rate instanceof HourlyRate ? 'hourly' : 'regular',
                    ] : null,
                ];
            });

        $sessions = BilliardSession::query()
            ->where('status', 'open')
            ->with(['billiardTable', 'tableRate', 'hourlyRate', 'tablePackage', 'user'])
            ->latest('started_at')
            ->get()
            ->map(fn ($s) => $this->mapSession($s));

        return Inertia::render($page, [
            'tables' => $tables,
            'sessions' => $sessions,
            'packages' => TablePackage::query()
                ->where('is_active', true)
                ->with('billiardTableType')
                ->orderBy('billiard_table_type_id')
                ->orderBy('duration_minutes')
                ->get(),
        ]);
    }

    private function mapSession(BilliardSession $session): array
    {
        return [
            'id' => $session->id,
            'billiard_table' => [
                'id' => $session->billiardTable->id,
                'name' => $session->billiardTable->name,
            ],
            'customer_name' => $session->customer_name,
            'planned_hours' => $session->planned_hours,
            'started_at' => $session->started_at->toIso8601String(),
            'table_rate' => $session->tableRate ? [
                'id' => $session->tableRate->id,
                'name' => $session->tableRate->name,
                'hourly_rate' => $session->tableRate->hourly_rate,
            ] : null,
            'hourly_rate' => $session->hourlyRate ? [
                'id' => $session->hourlyRate->id,
                'name' => $session->hourlyRate->name,
                'hourly_rate' => $session->hourlyRate->hourly_rate,
            ] : null,
            'table_package' => $session->tablePackage ? [
                'id' => $session->tablePackage->id,
                'name' => $session->tablePackage->name,
                'duration_minutes' => $session->tablePackage->duration_minutes,
                'price' => $session->tablePackage->price,
            ] : null,
        ];
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
        abort_unless(
            CashierShift::where('user_id', $request->user()->id)->where('status', 'open')->exists(),
            422,
            'Shift belum dibuka. Silakan buka shift terlebih dahulu.',
        );

        $session = DB::transaction(function () use ($request): BilliardSession {
            $table = BilliardTable::query()->lockForUpdate()->findOrFail($request->integer('billiard_table_id'));

            abort_unless(
                $table->status === 'available' && ! $table->billiardSessions()->where('status', 'open')->exists(),
                422,
                'Meja sedang tidak tersedia.',
            );

            if ($request->filled('table_package_id')) {
                $package = TablePackage::query()
                    ->whereKey($request->integer('table_package_id'))
                    ->where('billiard_table_type_id', $table->billiard_table_type_id)
                    ->where('is_active', true)
                    ->first();
                abort_unless($package !== null, 422, 'Paket tidak valid untuk tipe meja ini.');

                $session = BilliardSession::create([
                    'billiard_table_id' => $table->id,
                    'user_id' => $request->user()->id,
                    'customer_name' => $request->string('customer_name')->toString(),
                    'table_package_id' => $package->id,
                    'planned_hours' => (int) ceil($package->duration_minutes / 60),
                    'status' => 'open',
                    'started_at' => now(),
                ]);
            } else {
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
                    'planned_hours' => $request->filled('duration_hours') ? $request->integer('duration_hours') : null,
                    'status' => 'open',
                    'started_at' => now(),
                ]);
            }

            $table->update(['status' => 'occupied']);

            return $session->load(['billiardTable', 'tableRate', 'tablePackage']);
        });

        AuditLogger::record('created', $session, 'Membuka sesi '.$session->billiardTable->name, null, $session->toArray());
        session()->flash('toast', ['type' => 'success', 'message' => 'Sesi meja berhasil dibuka.']);

        return to_route($request->routeIs('cashier.pos.store') ? 'cashier.pos.index' : 'cashier.billiard-sessions.index');
    }

    public function close(CloseBilliardSessionRequest $request, BilliardSession $billiardSession)
    {
        abort_unless(
            CashierShift::where('user_id', $request->user()->id)->where('status', 'open')->exists(),
            422,
            'Shift belum dibuka. Silakan buka shift terlebih dahulu.',
        );

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

        // Record sale to shift
        CashierShift::recordSale($session, $session->total_amount);

        session()->flash('toast', ['type' => 'success', 'message' => 'Sesi meja berhasil ditutup.']);

        session()->flash('toast', ['type' => 'success', 'message' => 'Pembayaran berhasil! Struk telah dicetak.']);

        return Inertia::back();
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
