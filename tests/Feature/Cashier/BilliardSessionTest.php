<?php

use App\Enums\UserRole;
use App\Models\BilliardSession;
use App\Models\BilliardTable;
use App\Models\BilliardTableType;
use App\Models\CashierShift;
use App\Models\HourlyRate;
use App\Models\TablePackage;
use App\Models\TableRate;
use App\Models\User;
use Illuminate\Support\Carbon;

test('admins can view the billiard session page', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($user)->get(route('cashier.billiard-sessions.index'))->assertOk();
});

test('cashiers cannot access the admin billiard session page', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);

    $this->actingAs($user)->get(route('cashier.billiard-sessions.index'))->assertForbidden();
});

test('cashiers can open a session and occupy the table', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);
    CashierShift::factory()->open()->create(['user_id' => $user->id]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id, 'status' => 'available']);
    $rate = TableRate::factory()->create(['billiard_table_type_id' => $type->id, 'hourly_rate' => 60000]);

    $response = $this->actingAs($user)->post(route('cashier.billiard-sessions.store'), [
        'billiard_table_id' => $table->id,
        'customer_name' => 'Budi',
        'duration_hours' => 1,
        'table_rate_id' => $rate->id,
    ]);

    $response->assertRedirect(route('cashier.billiard-sessions.index'));
    $this->assertDatabaseHas('billiard_sessions', [
        'billiard_table_id' => $table->id,
        'customer_name' => 'Budi',
        'table_rate_id' => $rate->id,
        'status' => 'open',
    ]);
    expect($table->fresh()->status)->toBe('occupied');
});

test('cashiers can open a POS session with customer details', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);
    CashierShift::factory()->open()->create(['user_id' => $user->id]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id, 'status' => 'available']);
    TableRate::factory()->create(['billiard_table_type_id' => $type->id]);

    $this->actingAs($user)->post(route('cashier.pos.store'), [
        'billiard_table_id' => $table->id,
        'customer_name' => 'Andi',
        'duration_hours' => 2,
    ])->assertRedirect(route('cashier.pos.index'));

    $this->assertDatabaseHas('billiard_sessions', [
        'billiard_table_id' => $table->id,
        'customer_name' => 'Andi',
        'planned_hours' => 2,
        'status' => 'open',
    ]);
});

test('the session automatically snapshots the hourly rate for the arrival time', function () {
    Carbon::setTestNow(Carbon::parse('2026-09-08 13:00:00'));

    $user = User::factory()->create(['role' => UserRole::Cashier]);
    CashierShift::factory()->open()->create(['user_id' => $user->id]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id, 'status' => 'available']);
    TableRate::factory()->create(['billiard_table_type_id' => $type->id, 'hourly_rate' => 75000]);
    $dayRate = HourlyRate::factory()->create([
        'billiard_table_type_id' => $type->id,
        'name' => 'Tarif Siang',
        'starts_at' => '08:00',
        'ends_at' => '17:59',
        'hourly_rate' => 90000,
    ]);

    $this->actingAs($user)->post(route('cashier.billiard-sessions.store'), [
        'billiard_table_id' => $table->id,
        'customer_name' => 'Budi',
        'duration_hours' => 3,
    ])->assertRedirect(route('cashier.billiard-sessions.index'));

    $this->assertDatabaseHas('billiard_sessions', [
        'billiard_table_id' => $table->id,
        'hourly_rate_id' => $dayRate->id,
        'planned_hours' => 3,
    ]);

    Carbon::setTestNow();
});

test('a table cannot have two active sessions', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id, 'status' => 'occupied']);
    $rate = TableRate::factory()->create(['billiard_table_type_id' => $type->id]);
    BilliardSession::factory()->create(['billiard_table_id' => $table->id, 'table_rate_id' => $rate->id]);

    $this->actingAs($user)->post(route('cashier.billiard-sessions.store'), [
        'billiard_table_id' => $table->id,
        'customer_name' => 'Budi',
        'duration_hours' => 1,
        'table_rate_id' => $rate->id,
    ])->assertSessionHasErrors('billiard_table_id');
});

test('closing an hourly session calculates the rounded total and frees the table', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);
    CashierShift::factory()->open()->create(['user_id' => $user->id]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id, 'status' => 'occupied']);
    $rate = TableRate::factory()->create([
        'billiard_table_type_id' => $type->id,
        'hourly_rate' => 60000,
        'minimum_minutes' => 60,
        'rounding_minutes' => 30,
    ]);
    $session = BilliardSession::factory()->create([
        'user_id' => $user->id,
        'billiard_table_id' => $table->id,
        'table_rate_id' => $rate->id,
        'started_at' => now()->subMinutes(75),
    ]);

    $this->actingAs($user)->post(route('cashier.billiard-sessions.close', $session), [
        'ended_at' => now()->toDateTimeString(),
    ])->assertRedirect(); // Inertia::back() redirects to referer

    expect($session->fresh()->status)->toBe('closed')
        ->and($session->fresh()->total_amount)->toBe(90000)
        ->and($table->fresh()->status)->toBe('available');
});

test('closing a package session uses the package price', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);
    CashierShift::factory()->open()->create(['user_id' => $user->id]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id, 'status' => 'occupied']);
    $package = TablePackage::factory()->create(['billiard_table_type_id' => $type->id, 'price' => 125000]);
    $session = BilliardSession::factory()->create([
        'user_id' => $user->id,
        'billiard_table_id' => $table->id,
        'table_package_id' => $package->id,
    ]);

    $this->actingAs($user)->post(route('cashier.billiard-sessions.close', $session));

    expect($session->fresh()->total_amount)->toBe(125000);
});
