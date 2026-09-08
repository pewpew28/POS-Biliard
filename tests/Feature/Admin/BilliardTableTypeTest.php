<?php

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\BilliardTableType;
use App\Models\User;

test('admins can manage billiard table types', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $createResponse = $this->actingAs($user)->post(route('admin.master-data.table-types.store'), [
        'name' => 'Premium',
        'description' => 'Meja premium',
        'is_active' => true,
    ]);

    $createResponse->assertRedirect(route('admin.master-data.table-types.index'));
    $type = BilliardTableType::query()->where('name', 'Premium')->firstOrFail();
    $this->assertModelExists($type);
    expect(AuditLog::query()->where('action', 'created')->where('subject_id', $type->id)->exists())->toBeTrue();

    $updateResponse = $this->actingAs($user)->put(route('admin.master-data.table-types.update', $type), [
        'name' => 'Premium Updated',
        'description' => 'Meja premium updated',
        'is_active' => true,
    ]);

    $updateResponse->assertRedirect(route('admin.master-data.table-types.index'));
    $this->assertDatabaseHas('billiard_table_types', ['id' => $type->id, 'name' => 'Premium Updated']);

    $deleteResponse = $this->actingAs($user)->delete(route('admin.master-data.table-types.destroy', $type), ['current_password' => 'password']);

    $deleteResponse->assertRedirect(route('admin.master-data.table-types.index'));
    $this->assertModelMissing($type);
});

test('billiard table type data is validated', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($user)->post(route('admin.master-data.table-types.store'), []);

    $response->assertSessionHasErrors(['name']);
});

test('cashiers cannot access billiard table types', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);

    $response = $this->actingAs($user)->get(route('admin.master-data.table-types.index'));

    $response->assertForbidden();
});
