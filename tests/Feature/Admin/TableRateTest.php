<?php

use App\Enums\UserRole;
use App\Models\BilliardTableType;
use App\Models\TableRate;
use App\Models\User;

test('admins can manage table rates', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $type = BilliardTableType::factory()->create();

    $createResponse = $this->actingAs($user)->post(route('admin.master-data.table-rates.store'), [
        'billiard_table_type_id' => $type->id,
        'name' => 'Reguler',
        'hourly_rate' => 100000,
        'minimum_minutes' => 60,
        'rounding_minutes' => 30,
    ]);

    $createResponse->assertRedirect(route('admin.master-data.table-rates.index'));
    $rate = TableRate::query()->where('name', 'Reguler')->firstOrFail();

    $updateResponse = $this->actingAs($user)->put(route('admin.master-data.table-rates.update', $rate), [
        'billiard_table_type_id' => $type->id,
        'name' => 'Reguler Updated',
        'hourly_rate' => 125000,
        'minimum_minutes' => 60,
        'rounding_minutes' => 30,
    ]);

    $updateResponse->assertRedirect(route('admin.master-data.table-rates.index'));
    $this->assertDatabaseHas('table_rates', ['id' => $rate->id, 'name' => 'Reguler Updated', 'hourly_rate' => 125000]);

    $deleteResponse = $this->actingAs($user)->delete(route('admin.master-data.table-rates.destroy', $rate), ['current_password' => 'password']);

    $deleteResponse->assertRedirect(route('admin.master-data.table-rates.index'));
    $this->assertModelMissing($rate);
});

test('table rate data is validated', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($user)->post(route('admin.master-data.table-rates.store'), []);

    $response->assertSessionHasErrors(['billiard_table_type_id', 'name', 'hourly_rate', 'minimum_minutes', 'rounding_minutes']);
});

test('cashiers cannot access table rates', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);

    $response = $this->actingAs($user)->get(route('admin.master-data.table-rates.index'));

    $response->assertForbidden();
});
