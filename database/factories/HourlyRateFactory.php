<?php

namespace Database\Factories;

use App\Models\BilliardTableType;
use App\Models\HourlyRate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HourlyRate>
 */
class HourlyRateFactory extends Factory
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
            'name' => 'Tarif Malam',
            'day_of_week' => null,
            'starts_at' => '18:00',
            'ends_at' => '23:59',
            'hourly_rate' => 125000,
            'is_active' => true,
        ];
    }
}
