<?php

use App\Enums\UserRole;
use App\Models\BilliardTable;
use App\Models\BilliardTableType;
use App\Models\User;

test('admins can view the billiard table management page', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($user)->get(route('admin.billiard-tables.index'));

    $response->assertOk();
});

test('cashiers cannot access the billiard table management page', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);

    $response = $this->actingAs($user)->get(route('admin.billiard-tables.index'));

    $response->assertForbidden();
});

test('admins can create a billiard table', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $type = BilliardTableType::factory()->create();

    $response = $this->actingAs($user)->post(route('admin.billiard-tables.store'), [
        'name' => 'Meja 01',
        'billiard_table_type_id' => $type->id,
        'status' => 'available',
        'notes' => 'Meja tournament',
    ]);

    $response->assertRedirect(route('admin.billiard-tables.index'));
    $this->assertDatabaseHas('billiard_tables', [
        'name' => 'Meja 01',
        'billiard_table_type_id' => $type->id,
        'status' => 'available',
    ]);
});

test('billiard table data is validated', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($user)->post(route('admin.billiard-tables.store'), []);

    $response->assertSessionHasErrors(['name', 'billiard_table_type_id', 'status']);
    $this->assertDatabaseCount('billiard_tables', 0);
});

test('admins can update and delete a billiard table', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id]);

    $updateResponse = $this->actingAs($user)->put(route('admin.billiard-tables.update', $table), [
        'name' => 'Meja Utama',
        'billiard_table_type_id' => $type->id,
        'status' => 'maintenance',
        'notes' => null,
    ]);

    $updateResponse->assertRedirect(route('admin.billiard-tables.index'));
    $this->assertDatabaseHas('billiard_tables', [
        'id' => $table->id,
        'name' => 'Meja Utama',
        'billiard_table_type_id' => $type->id,
        'status' => 'maintenance',
    ]);

    $deleteResponse = $this->actingAs($user)->delete(route('admin.billiard-tables.destroy', $table), ['current_password' => 'password']);

    $deleteResponse->assertRedirect(route('admin.billiard-tables.index'));
    $this->assertDatabaseMissing('billiard_tables', ['id' => $table->id]);
});

test('deleting a billiard table requires the current password', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $type = BilliardTableType::factory()->create();
    $table = BilliardTable::factory()->create(['billiard_table_type_id' => $type->id]);

    $response = $this->actingAs($user)->delete(route('admin.billiard-tables.destroy', $table), [
        'current_password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('current_password');
    $this->assertModelExists($table);
});
