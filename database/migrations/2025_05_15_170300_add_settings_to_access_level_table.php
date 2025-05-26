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
        Schema::table('assets_transaction', function (Blueprint $table) {
            $table->string('attachment')->nullable()->after('assets_transaction_total_cost');
        });

        Schema::table('access_level', function (Blueprint $table) {
            $table->boolean('settings')->default(false)->after('name');
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
