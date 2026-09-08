<?php

namespace App\Models;

use Database\Factories\HourlyRateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HourlyRate extends Model
{
    /** @use HasFactory<HourlyRateFactory> */
    use HasFactory;

    protected $fillable = ['billiard_table_type_id', 'name', 'day_of_week', 'starts_at', 'ends_at', 'hourly_rate', 'is_active'];

    protected function casts(): array
    {
        return ['day_of_week' => 'integer', 'hourly_rate' => 'integer', 'is_active' => 'boolean'];
    }

    public function billiardTableType(): BelongsTo
    {
        return $this->belongsTo(BilliardTableType::class);
    }
}
