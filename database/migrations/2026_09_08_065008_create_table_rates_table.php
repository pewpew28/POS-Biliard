<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('table_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billiard_table_type_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedInteger('hourly_rate');
            $table->unsignedInteger('minimum_minutes')->default(60);
            $table->unsignedInteger('rounding_minutes')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['billiard_table_type_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_rates');
    }
};
