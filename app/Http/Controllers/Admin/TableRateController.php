<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmPasswordRequest;
use App\Http\Requests\Admin\StoreTableRateRequest;
use App\Http\Requests\Admin\UpdateTableRateRequest;
use App\Models\BilliardTableType;
use App\Models\TableRate;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TableRateController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/master-data/table-rates/index', [
            'rates' => TableRate::query()->with('billiardTableType')->orderBy('name')->get(),
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/master-data/table-rates/form', [
            'rate' => null,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreTableRateRequest $request): RedirectResponse
    {
        $tableRate = TableRate::create($request->validated());
        AuditLogger::record('created', $tableRate, 'Menambahkan tarif per type '.$tableRate->name, null, $tableRate->toArray());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarif per type berhasil ditambahkan.']);

        return to_route('admin.master-data.table-rates.index');
    }

    public function edit(TableRate $tableRate): Response
    {
        return Inertia::render('admin/master-data/table-rates/form', [
            'rate' => $tableRate,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateTableRateRequest $request, TableRate $tableRate): RedirectResponse
    {
        $oldValues = $tableRate->getOriginal();
        $tableRate->update($request->validated());
        AuditLogger::record('updated', $tableRate, 'Mengubah tarif per type '.$tableRate->name, $oldValues, $tableRate->fresh()?->toArray() ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarif per type berhasil diperbarui.']);

        return to_route('admin.master-data.table-rates.index');
    }

    public function destroy(ConfirmPasswordRequest $request, TableRate $tableRate): RedirectResponse
    {
        $oldValues = $tableRate->toArray();
        $tableRate->delete();
        AuditLogger::record('deleted', $tableRate, 'Menghapus tarif per type '.$tableRate->name, $oldValues);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Tarif per type berhasil dihapus.']);

        return to_route('admin.master-data.table-rates.index');
    }
}
