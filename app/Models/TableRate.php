<?php

namespace App\Models;

use Database\Factories\TableRateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TableRate extends Model
{
    /** @use HasFactory<TableRateFactory> */
    use HasFactory;

    protected $fillable = ['billiard_table_type_id', 'name', 'hourly_rate', 'minimum_minutes', 'rounding_minutes', 'is_active'];

    protected function casts(): array
    {
        return ['hourly_rate' => 'integer', 'minimum_minutes' => 'integer', 'rounding_minutes' => 'integer', 'is_active' => 'boolean'];
    }

    public function billiardTableType(): BelongsTo
    {
        return $this->belongsTo(BilliardTableType::class);
    }
}
