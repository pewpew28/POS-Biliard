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
        Schema::create('hourly_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billiard_table_type_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->time('starts_at');
            $table->time('ends_at');
            $table->unsignedInteger('hourly_rate');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['billiard_table_type_id', 'day_of_week', 'starts_at', 'ends_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hourly_rates');
    }
};
