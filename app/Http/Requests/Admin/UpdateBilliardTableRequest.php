<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBilliardTableRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100', 'unique:billiard_tables,name,'.$this->route('billiard_table')->id],
            'billiard_table_type_id' => ['required', 'exists:billiard_table_types,id'],
            'status' => ['required', 'in:available,maintenance,inactive'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
