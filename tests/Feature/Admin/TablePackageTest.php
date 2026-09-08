<?php

use App\Enums\UserRole;
use App\Models\BilliardTableType;
use App\Models\TablePackage;
use App\Models\User;

test('admins can manage table packages', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $type = BilliardTableType::factory()->create();

    $createResponse = $this->actingAs($user)->post(route('admin.master-data.packages.store'), [
        'billiard_table_type_id' => $type->id,
        'name' => 'Paket Dua Jam',
        'duration_minutes' => 120,
        'price' => 180000,
        'notes' => 'Harga promo',
    ]);

    $createResponse->assertRedirect(route('admin.master-data.packages.index'));
    $package = TablePackage::query()->where('name', 'Paket Dua Jam')->firstOrFail();

    $updateResponse = $this->actingAs($user)->put(route('admin.master-data.packages.update', $package), [
        'billiard_table_type_id' => $type->id,
        'name' => 'Paket Dua Jam Updated',
        'duration_minutes' => 120,
        'price' => 200000,
        'notes' => null,
    ]);

    $updateResponse->assertRedirect(route('admin.master-data.packages.index'));
    $this->assertDatabaseHas('table_packages', ['id' => $package->id, 'name' => 'Paket Dua Jam Updated', 'price' => 200000]);

    $deleteResponse = $this->actingAs($user)->delete(route('admin.master-data.packages.destroy', $package), ['current_password' => 'password']);

    $deleteResponse->assertRedirect(route('admin.master-data.packages.index'));
    $this->assertModelMissing($package);
});

test('table package data is validated', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($user)->post(route('admin.master-data.packages.store'), []);

    $response->assertSessionHasErrors(['name', 'duration_minutes', 'price']);
});

test('cashiers cannot access table packages', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);

    $response = $this->actingAs($user)->get(route('admin.master-data.packages.index'));

    $response->assertForbidden();
});
