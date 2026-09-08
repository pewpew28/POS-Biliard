<?php

namespace App\Models;

use Database\Factories\BilliardTableFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property int $billiard_table_type_id
 * @property string $status
 * @property string|null $notes
 */
class BilliardTable extends Model
{
    /** @use HasFactory<BilliardTableFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'billiard_table_type_id',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
        ];
    }

    public function billiardTableType(): BelongsTo
    {
        return $this->belongsTo(BilliardTableType::class);
    }

    public function billiardSessions(): HasMany
    {
        return $this->hasMany(BilliardSession::class);
    }
}
