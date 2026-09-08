<?php

namespace App\Models;

use Database\Factories\TablePackageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TablePackage extends Model
{
    /** @use HasFactory<TablePackageFactory> */
    use HasFactory;

    protected $fillable = ['billiard_table_type_id', 'name', 'duration_minutes', 'price', 'notes', 'is_active'];

    protected function casts(): array
    {
        return ['duration_minutes' => 'integer', 'price' => 'integer', 'is_active' => 'boolean'];
    }

    public function billiardTableType(): BelongsTo
    {
        return $this->belongsTo(BilliardTableType::class);
    }
}
