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
        Schema::create('users_branch', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('assets_branch')->cascadeOnDelete();
            $table->unique(['user_id', 'branch_id']);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            // Drop the foreign key first
            $table->dropForeign(['branch_id']);

            // Then drop the column
            $table->dropColumn('branch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets_transaction', function (Blueprint $table) {
            $table->dropColumn('attachment');
        });
        Schema::table('access_level', function (Blueprint $table) {
            $table->dropColumn('settings');
        });
    }
};
