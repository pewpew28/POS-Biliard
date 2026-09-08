<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmPasswordRequest;
use App\Http\Requests\Admin\StoreHourlyRateRequest;
use App\Http\Requests\Admin\UpdateHourlyRateRequest;
use App\Models\BilliardTableType;
use App\Models\HourlyRate;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class HourlyRateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/master-data/hourly-rates/index', [
            'rates' => HourlyRate::query()->with('billiardTableType')->orderBy('name')->get(),
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/master-data/hourly-rates/form', [
            'rate' => null,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreHourlyRateRequest $request): RedirectResponse
    {
        $hourlyRate = HourlyRate::create($request->validated());
        AuditLogger::record('created', $hourlyRate, 'Menambahkan tarif khusus jam '.$hourlyRate->name, null, $hourlyRate->toArray());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarif khusus jam berhasil ditambahkan.']);

        return to_route('admin.master-data.hourly-rates.index');
    }

    public function edit(HourlyRate $hourlyRate): Response
    {
        return Inertia::render('admin/master-data/hourly-rates/form', [
            'rate' => $hourlyRate,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateHourlyRateRequest $request, HourlyRate $hourlyRate): RedirectResponse
    {
        $oldValues = $hourlyRate->getOriginal();
        $hourlyRate->update($request->validated());
        AuditLogger::record('updated', $hourlyRate, 'Mengubah tarif khusus jam '.$hourlyRate->name, $oldValues, $hourlyRate->fresh()?->toArray() ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarif khusus jam berhasil diperbarui.']);

        return to_route('admin.master-data.hourly-rates.index');
    }

    public function destroy(ConfirmPasswordRequest $request, HourlyRate $hourlyRate): RedirectResponse
    {
        $oldValues = $hourlyRate->toArray();
        $hourlyRate->delete();
        AuditLogger::record('deleted', $hourlyRate, 'Menghapus tarif khusus jam '.$hourlyRate->name, $oldValues);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarif khusus jam berhasil dihapus.']);

        return to_route('admin.master-data.hourly-rates.index');
    }
}
