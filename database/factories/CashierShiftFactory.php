<?php

namespace Database\Factories;

use App\Models\CashierShift;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashierShift>
 */
class CashierShiftFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'opened_at' => now(),
            'initial_balance' => 500000,
            'final_balance' => null,
            'total_sales' => 0,
            'total_transactions' => 0,
            'status' => 'open',
            'notes' => null,
        ];
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'open',
            'final_balance' => null,
            'closed_at' => null,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
            'final_balance' => $attributes['initial_balance'] + $attributes['total_sales'],
            'closed_at' => now(),
        ]);
    }
}
