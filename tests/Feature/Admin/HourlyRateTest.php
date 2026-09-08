<?php

use App\Enums\UserRole;
use App\Models\BilliardTableType;
use App\Models\HourlyRate;
use App\Models\User;

test('admins can manage hourly rates', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);
    $type = BilliardTableType::factory()->create();

    $createResponse = $this->actingAs($user)->post(route('admin.master-data.hourly-rates.store'), [
        'billiard_table_type_id' => $type->id,
        'name' => 'Malam',
        'starts_at' => '18:00',
        'ends_at' => '23:00',
        'hourly_rate' => 125000,
    ]);

    $createResponse->assertRedirect(route('admin.master-data.hourly-rates.index'));
    $rate = HourlyRate::query()->where('name', 'Malam')->firstOrFail();

    $updateResponse = $this->actingAs($user)->put(route('admin.master-data.hourly-rates.update', $rate), [
        'billiard_table_type_id' => $type->id,
        'name' => 'Malam Updated',
        'starts_at' => '19:00',
        'ends_at' => '23:30',
        'hourly_rate' => 150000,
    ]);

    $updateResponse->assertRedirect(route('admin.master-data.hourly-rates.index'));
    $this->assertDatabaseHas('hourly_rates', ['id' => $rate->id, 'name' => 'Malam Updated', 'hourly_rate' => 150000]);

    $deleteResponse = $this->actingAs($user)->delete(route('admin.master-data.hourly-rates.destroy', $rate), ['current_password' => 'password']);

    $deleteResponse->assertRedirect(route('admin.master-data.hourly-rates.index'));
    $this->assertModelMissing($rate);
});

test('hourly rate data is validated', function () {
    $user = User::factory()->create(['role' => UserRole::Admin]);

    $response = $this->actingAs($user)->post(route('admin.master-data.hourly-rates.store'), []);

    $response->assertSessionHasErrors(['billiard_table_type_id', 'name', 'starts_at', 'ends_at', 'hourly_rate']);
});

test('cashiers cannot access hourly rates', function () {
    $user = User::factory()->create(['role' => UserRole::Cashier]);

    $response = $this->actingAs($user)->get(route('admin.master-data.hourly-rates.index'));

    $response->assertForbidden();
});
