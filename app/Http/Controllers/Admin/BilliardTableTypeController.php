<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmPasswordRequest;
use App\Http\Requests\Admin\StoreBilliardTableTypeRequest;
use App\Http\Requests\Admin\UpdateBilliardTableTypeRequest;
use App\Models\BilliardTableType;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BilliardTableTypeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/master-data/table-types/index', [
            'types' => BilliardTableType::query()->withCount('billiardTables')->orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/master-data/table-types/form', ['tableType' => null]);
    }

    public function store(StoreBilliardTableTypeRequest $request): RedirectResponse
    {
        $tableType = BilliardTableType::create($request->validated());
        AuditLogger::record('created', $tableType, 'Menambahkan type meja '.$tableType->name, null, $tableType->toArray());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Type meja berhasil ditambahkan.']);

        return to_route('admin.master-data.table-types.index');
    }

    public function edit(BilliardTableType $tableType): Response
    {
        return Inertia::render('admin/master-data/table-types/form', ['tableType' => $tableType]);
    }

    public function update(UpdateBilliardTableTypeRequest $request, BilliardTableType $tableType): RedirectResponse
    {
        $oldValues = $tableType->getOriginal();
        $tableType->update($request->validated());
        AuditLogger::record('updated', $tableType, 'Mengubah type meja '.$tableType->name, $oldValues, $tableType->fresh()?->toArray() ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Type meja berhasil diperbarui.']);

        return to_route('admin.master-data.table-types.index');
    }

    public function destroy(ConfirmPasswordRequest $request, BilliardTableType $tableType): RedirectResponse
    {
        $oldValues = $tableType->toArray();
        $tableType->delete();
        AuditLogger::record('deleted', $tableType, 'Menghapus type meja '.$tableType->name, $oldValues);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Type meja berhasil dihapus.']);

        return to_route('admin.master-data.table-types.index');
    }
}
