<?php

use App\Http\Controllers\Admin\AdminBilliardTransactionController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\BilliardTableController;
use App\Http\Controllers\Admin\BilliardTableTypeController;
use App\Http\Controllers\Admin\HourlyRateController;
use App\Http\Controllers\Admin\TablePackageController;
use App\Http\Controllers\Admin\TableRateController;
use App\Http\Controllers\Cashier\BilliardPaymentController;
use App\Http\Controllers\Cashier\BilliardSessionController;
use App\Http\Controllers\Cashier\CashierBilliardTransactionController;
use App\Http\Controllers\Cashier\CashierShiftController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::prefix('cashier')->name('cashier.')->middleware('role:cashier,admin,super_admin')->group(function () {
        Route::get('billiard-sessions', [BilliardSessionController::class, 'index'])
            ->middleware('role:admin,super_admin')
            ->name('billiard-sessions.index');
        Route::get('billiard-sessions/create', [BilliardSessionController::class, 'create'])
            ->middleware('role:admin,super_admin')
            ->name('billiard-sessions.create');
        Route::post('billiard-sessions', [BilliardSessionController::class, 'store'])->name('billiard-sessions.store');
        Route::post('billiard-sessions/{billiardSession}/close', [BilliardSessionController::class, 'close'])->name('billiard-sessions.close');
    });
    Route::prefix('cashier/pos')->name('cashier.pos.')->middleware('role:cashier')->group(function () {
        Route::get('/', [BilliardSessionController::class, 'pos'])->name('index');
        Route::post('sessions', [BilliardSessionController::class, 'store'])->name('store');
        Route::get('sessions/{billiardSession}/payment', [BilliardPaymentController::class, 'create'])->name('payment.create');
        Route::post('sessions/{billiardSession}/close', [BilliardSessionController::class, 'close'])->name('close');
        Route::get('transactions', [CashierBilliardTransactionController::class, 'index'])->name('transactions');
    });
    Route::prefix('cashier/shift')->name('cashier.shift.')->middleware('role:cashier')->group(function () {
        Route::get('/', [CashierShiftController::class, 'index'])->name('index');
        Route::post('open', [CashierShiftController::class, 'open'])->name('open');
        Route::post('close', [CashierShiftController::class, 'close'])->name('close');
        Route::post('mutation', [CashierShiftController::class, 'addMutation'])->name('mutation');
    });
    Route::prefix('admin')->name('admin.')->middleware('role:admin,super_admin')->group(function () {
        Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('transactions', [AdminBilliardTransactionController::class, 'index'])->name('transactions.index');
        Route::resource('billiard-tables', BilliardTableController::class)
            ->except(['show']);
        Route::prefix('master-data')->name('master-data.')->group(function () {
            Route::resource('table-types', BilliardTableTypeController::class)->except(['show']);
            Route::resource('table-rates', TableRateController::class)->except(['show']);
            Route::resource('hourly-rates', HourlyRateController::class)->except(['show']);
            Route::resource('packages', TablePackageController::class)->except(['show']);
        });
    });
});

require __DIR__.'/settings.php';
