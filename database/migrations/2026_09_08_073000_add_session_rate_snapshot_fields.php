<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('billiard_sessions', function (Blueprint $table) {
            $table->foreignId('hourly_rate_id')->nullable()->after('table_rate_id')->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('planned_hours')->nullable()->after('duration_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('billiard_sessions', function (Blueprint $table) {
            $table->dropForeign(['hourly_rate_id']);
            $table->dropColumn(['hourly_rate_id', 'planned_hours']);
        });
    }
};
