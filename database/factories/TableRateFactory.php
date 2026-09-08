<?php

namespace Database\Factories;

use App\Models\BilliardTableType;
use App\Models\TableRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TableRate>
 */
class TableRateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'billiard_table_type_id' => BilliardTableType::factory(),
            'name' => 'Tarif Reguler',
            'hourly_rate' => 100000,
            'minimum_minutes' => 60,
            'rounding_minutes' => 30,
            'is_active' => true,
        ];
    }
}
