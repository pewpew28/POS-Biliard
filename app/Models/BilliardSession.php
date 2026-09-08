<?php

namespace App\Models;

use Database\Factories\BilliardSessionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BilliardSession extends Model
{
    /** @use HasFactory<BilliardSessionFactory> */
    use HasFactory;

    protected $fillable = [
        'billiard_table_id',
        'user_id',
        'customer_name',
        'table_rate_id',
        'hourly_rate_id',
        'table_package_id',
        'status',
        'started_at',
        'ended_at',
        'duration_minutes',
        'planned_hours',
        'total_amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'duration_minutes' => 'integer',
            'planned_hours' => 'integer',
            'total_amount' => 'integer',
        ];
    }

    public function billiardTable(): BelongsTo
    {
        return $this->belongsTo(BilliardTable::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tableRate(): BelongsTo
    {
        return $this->belongsTo(TableRate::class);
    }

    public function hourlyRate(): BelongsTo
    {
        return $this->belongsTo(HourlyRate::class);
    }

    public function tablePackage(): BelongsTo
    {
        return $this->belongsTo(TablePackage::class);
    }
}
