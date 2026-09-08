<?php

namespace Database\Factories;

use App\Models\TablePackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TablePackage>
 */
class TablePackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'billiard_table_type_id' => null,
            'name' => fake()->unique()->words(2, true),
            'duration_minutes' => 120,
            'price' => 180000,
            'notes' => null,
            'is_active' => true,
        ];
    }
}
