<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTableRateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'billiard_table_type_id' => ['required', 'exists:billiard_table_types,id'],
            'name' => ['required', 'string', 'max:100'],
            'hourly_rate' => ['required', 'integer', 'min:0'],
            'minimum_minutes' => ['required', 'integer', 'min:1'],
            'rounding_minutes' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
