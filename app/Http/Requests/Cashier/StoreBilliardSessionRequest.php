<?php

namespace App\Http\Requests\Cashier;

use App\Models\BilliardTable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreBilliardSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'billiard_table_id' => ['required', 'exists:billiard_tables,id'],
            'customer_name' => ['required', 'string', 'max:120'],
            'duration_hours' => ['nullable', 'integer', 'min:1', 'max:12'],
            'table_package_id' => ['nullable', 'exists:table_packages,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $table = BilliardTable::find($this->integer('billiard_table_id'));
                if ($table?->status !== 'available') {
                    $validator->errors()->add('billiard_table_id', 'Meja tidak tersedia.');
                }

                if ($table?->billiardTableType === null) {
                    return;
                }

                if ($this->filled('table_package_id')) {
                    $matchesType = \App\Models\TablePackage::query()
                        ->whereKey($this->integer('table_package_id'))
                        ->where('billiard_table_type_id', $table->billiard_table_type_id)
                        ->where('is_active', true)
                        ->exists();
                    if (! $matchesType) {
                        $validator->errors()->add('table_package_id', 'Paket tidak valid untuk tipe meja ini.');
                    }
                }
            },
        ];
    }
}
