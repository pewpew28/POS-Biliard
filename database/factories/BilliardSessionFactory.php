<?php

namespace Database\Factories;

use App\Models\BilliardSession;
use App\Models\BilliardTable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BilliardSession>
 */
class BilliardSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'billiard_table_id' => BilliardTable::factory(),
            'user_id' => User::factory(),
            'customer_name' => fake()->name(),
            'table_rate_id' => null,
            'hourly_rate_id' => null,
            'table_package_id' => null,
            'status' => 'open',
            'started_at' => now()->subHour(),
            'ended_at' => null,
            'duration_minutes' => null,
            'planned_hours' => null,
            'total_amount' => null,
            'notes' => null,
        ];
    }
}
