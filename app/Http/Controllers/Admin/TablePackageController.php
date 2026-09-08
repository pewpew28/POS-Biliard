<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmPasswordRequest;
use App\Http\Requests\Admin\StoreTablePackageRequest;
use App\Http\Requests\Admin\UpdateTablePackageRequest;
use App\Models\BilliardTableType;
use App\Models\TablePackage;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TablePackageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/master-data/packages/index', [
            'packages' => TablePackage::query()->with('billiardTableType')->orderBy('name')->get(),
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/master-data/packages/form', [
            'package' => null,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreTablePackageRequest $request): RedirectResponse
    {
        $package = TablePackage::create($request->validated());
        AuditLogger::record('created', $package, 'Menambahkan paket tarif '.$package->name, null, $package->toArray());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paket tarif berhasil ditambahkan.']);

        return to_route('admin.master-data.packages.index');
    }

    public function edit(TablePackage $package): Response
    {
        return Inertia::render('admin/master-data/packages/form', [
            'package' => $package,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateTablePackageRequest $request, TablePackage $package): RedirectResponse
    {
        $oldValues = $package->getOriginal();
        $package->update($request->validated());
        AuditLogger::record('updated', $package, 'Mengubah paket tarif '.$package->name, $oldValues, $package->fresh()?->toArray() ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paket tarif berhasil diperbarui.']);

        return to_route('admin.master-data.packages.index');
    }

    public function destroy(ConfirmPasswordRequest $request, TablePackage $package): RedirectResponse
    {
        $oldValues = $package->toArray();
        $package->delete();
        AuditLogger::record('deleted', $package, 'Menghapus paket tarif '.$package->name, $oldValues);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Paket tarif berhasil dihapus.']);

        return to_route('admin.master-data.packages.index');
    }
}
