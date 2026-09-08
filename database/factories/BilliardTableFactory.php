<?php

namespace Database\Factories;

use App\Models\BilliardTable;
use App\Models\BilliardTableType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BilliardTable>
 */
class BilliardTableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Meja '.$this->faker->unique()->numberBetween(1, 99),
            'billiard_table_type_id' => BilliardTableType::factory(),
            'status' => 'available',
            'notes' => null,
        ];
    }
}
