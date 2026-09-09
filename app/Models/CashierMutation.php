<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashierMutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashier_shift_id',
        'billiard_session_id',
        'type',
        'amount',
        'description',
    ];

    protected $casts = [
        'amount' => 'integer',
    ];

    public function shift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class, 'cashier_shift_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(BilliardSession::class, 'billiard_session_id');
    }

    public function isSale(): bool
    {
        return $this->type === 'sale';
    }
}
