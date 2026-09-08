<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('billiard_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('billiard_table_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('table_rate_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('table_package_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('open');
            $table->dateTime('started_at');
            $table->dateTime('ended_at')->nullable();
            $table->unsignedInteger('duration_minutes')->nullable();
            $table->unsignedInteger('total_amount')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'started_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('billiard_sessions');
    }
};
