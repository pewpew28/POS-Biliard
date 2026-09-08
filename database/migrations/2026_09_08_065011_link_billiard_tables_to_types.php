<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('billiard_tables', function (Blueprint $table): void {
            $table->foreignId('billiard_table_type_id')->nullable()->after('name')->constrained()->restrictOnDelete();
            $table->dropColumn('hourly_rate');
        });
    }

    public function down(): void
    {
        Schema::table('billiard_tables', function (Blueprint $table): void {
            $table->unsignedInteger('hourly_rate')->default(0)->after('name');
            $table->dropConstrainedForeignId('billiard_table_type_id');
        });
    }
};
