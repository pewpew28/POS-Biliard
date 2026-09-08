<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ConfirmPasswordRequest;
use App\Http\Requests\Admin\StoreBilliardTableRequest;
use App\Http\Requests\Admin\UpdateBilliardTableRequest;
use App\Models\BilliardTable;
use App\Models\BilliardTableType;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BilliardTableController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('admin/billiard-tables/index', [
            'tables' => BilliardTable::query()
                ->orderBy('name')
                ->with('billiardTableType')
                ->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/billiard-tables/form', [
            'table' => null,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBilliardTableRequest $request): RedirectResponse
    {
        $table = BilliardTable::create($request->validated());
        AuditLogger::record('created', $table, 'Menambahkan meja biliar '.$table->name, null, $table->toArray());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Meja biliar berhasil ditambahkan.']);

        return to_route('admin.billiard-tables.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(BilliardTable $billiardTable): Response
    {
        return Inertia::render('admin/billiard-tables/show', [
            'table' => $billiardTable,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BilliardTable $billiardTable): Response
    {
        return Inertia::render('admin/billiard-tables/form', [
            'table' => $billiardTable,
            'types' => BilliardTableType::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBilliardTableRequest $request, BilliardTable $billiardTable): RedirectResponse
    {
        $oldValues = $billiardTable->getOriginal();
        $billiardTable->update($request->validated());
        AuditLogger::record('updated', $billiardTable, 'Mengubah meja biliar '.$billiardTable->name, $oldValues, $billiardTable->fresh()?->toArray() ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Meja biliar berhasil diperbarui.']);

        return to_route('admin.billiard-tables.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ConfirmPasswordRequest $request, BilliardTable $billiardTable): RedirectResponse
    {
        $oldValues = $billiardTable->toArray();
        $billiardTable->delete();
        AuditLogger::record('deleted', $billiardTable, 'Menghapus meja biliar '.$billiardTable->name, $oldValues);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Meja biliar berhasil dihapus.']);

        return to_route('admin.billiard-tables.index');
    }
}
