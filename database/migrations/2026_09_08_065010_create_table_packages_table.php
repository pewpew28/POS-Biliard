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
        Schema::create('table_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billiard_table_type_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->unique();
            $table->unsignedInteger('duration_minutes');
            $table->unsignedInteger('price');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_packages');
    }
};
