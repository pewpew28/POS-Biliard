<?php

namespace App\Models;

use Database\Factories\BilliardTableTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BilliardTableType extends Model
{
    /** @use HasFactory<BilliardTableTypeFactory> */
    use HasFactory;

    protected $fillable = ['name', 'description', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function billiardTables(): HasMany
    {
        return $this->hasMany(BilliardTable::class);
    }

    public function tableRates(): HasMany
    {
        return $this->hasMany(TableRate::class);
    }

    public function hourlyRates(): HasMany
    {
        return $this->hasMany(HourlyRate::class);
    }

    public function tablePackages(): HasMany
    {
        return $this->hasMany(TablePackage::class);
    }
}
