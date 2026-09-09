<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashierShift extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'opened_at',
        'closed_at',
        'initial_balance',
        'final_balance',
        'total_sales',
        'total_transactions',
        'status',
        'notes',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'initial_balance' => 'integer',
        'final_balance' => 'integer',
        'total_sales' => 'integer',
        'total_transactions' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function mutations(): HasMany
    {
        return $this->hasMany(CashierMutation::class);
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function getCurrentBalance(): int
    {
        return $this->initial_balance + $this->total_sales;
    }

    public static function recordSale(BilliardSession $session, int $amount): void
    {
        $shift = static::where('user_id', $session->user_id)->where('status', 'open')->first();

        if (! $shift) {
            return;
        }

        CashierMutation::create([
            'cashier_shift_id' => $shift->id,
            'billiard_session_id' => $session->id,
            'type' => 'sale',
            'amount' => $amount,
            'description' => "Pembayaran {$session->billiardTable->name}",
        ]);

        $shift->increment('total_sales', $amount);
        $shift->increment('total_transactions');
    }
}
