<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\BilliardTable;
use App\Models\BilliardTableType;
use App\Models\HourlyRate;
use App\Models\TablePackage;
use App\Models\TableRate;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => env('SUPER_ADMIN_PASSWORD', 'password'),
                'role' => UserRole::SuperAdmin,
                'email_verified_at' => now(),
            ],
        );

        $types = [
            'Standard' => 'Meja biliar standar untuk permainan harian.',
            'Premium' => 'Meja dengan kualitas kain dan fasilitas premium.',
            'VIP' => 'Meja VIP untuk reservasi dan layanan eksklusif.',
        ];

        foreach ($types as $name => $description) {
            $type = BilliardTableType::query()->updateOrCreate(
                ['name' => $name],
                ['description' => $description, 'is_active' => true],
            );

            $tableRate = match ($name) {
                'Standard' => 75000,
                'Premium' => 100000,
                'VIP' => 150000,
            };

            TableRate::query()->updateOrCreate(
                ['billiard_table_type_id' => $type->id, 'name' => 'Tarif Reguler'],
                [
                    'hourly_rate' => $tableRate,
                    'minimum_minutes' => 60,
                    'rounding_minutes' => 30,
                    'is_active' => true,
                ],
            );

            HourlyRate::query()->updateOrCreate(
                ['billiard_table_type_id' => $type->id, 'name' => 'Tarif Prime Time'],
                [
                    'day_of_week' => null,
                    'starts_at' => '18:00',
                    'ends_at' => '23:00',
                    'hourly_rate' => $tableRate + 25000,
                    'is_active' => true,
                ],
            );

            foreach ([120, 180] as $duration) {
                TablePackage::query()->updateOrCreate(
                    [
                        'billiard_table_type_id' => $type->id,
                        'name' => "{$name} {$duration} Menit",
                    ],
                    [
                        'duration_minutes' => $duration,
                        'price' => (int) (($tableRate * $duration / 60) * 0.9),
                        'notes' => 'Harga paket hemat 10%.',
                        'is_active' => true,
                    ],
                );
            }
        }

        $tables = [
            ['name' => 'Meja 01', 'type' => 'Standard', 'status' => 'available'],
            ['name' => 'Meja 02', 'type' => 'Standard', 'status' => 'available'],
            ['name' => 'Meja 03', 'type' => 'Premium', 'status' => 'available'],
            ['name' => 'Meja 04', 'type' => 'Premium', 'status' => 'maintenance'],
            ['name' => 'Meja 05', 'type' => 'VIP', 'status' => 'available'],
            ['name' => 'Meja 06', 'type' => 'VIP', 'status' => 'inactive'],
        ];

        foreach ($tables as $table) {
            BilliardTable::query()->updateOrCreate(
                ['name' => $table['name']],
                [
                    'billiard_table_type_id' => BilliardTableType::query()
                        ->where('name', $table['type'])
                        ->value('id'),
                    'status' => $table['status'],
                    'notes' => null,
                ],
            );
        }
    }
}
