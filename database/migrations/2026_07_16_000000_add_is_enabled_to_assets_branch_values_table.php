<?php

/**
 * Raw SQL for manual execution on the live server (MySQL 5.7+/MariaDB compatible):
 *
 * ALTER TABLE `assets_branch_values`
 *   ADD COLUMN `is_enabled` TINYINT(1) NOT NULL DEFAULT 1 AFTER `asset_current_unit`;
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets_branch_values', function (Blueprint $table) {
            $table->boolean('is_enabled')->default(true)->after('asset_current_unit');
        });
    }

    public function down(): void
    {
        Schema::table('assets_branch_values', function (Blueprint $table) {
            $table->dropColumn('is_enabled');
        });
    }
};
