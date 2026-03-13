<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * SQL Query:
     * ALTER TABLE `access_level` ADD COLUMN `amend_asset` TINYINT(1) NOT NULL DEFAULT 0 AFTER `receive_transaction`;
     * ALTER TABLE `assets_branch_values` ADD COLUMN `branch_value_log` JSON NULL AFTER `asset_current_unit`;
     */
    public function up(): void
    {
        Schema::table('access_level', function (Blueprint $table) {
            if (!Schema::hasColumn('access_level', 'amend_asset')) {
                $table->boolean('amend_asset')->default(false)->after('receive_transaction');
            }
        });

        Schema::table('assets_branch_values', function (Blueprint $table) {
            if (!Schema::hasColumn('assets_branch_values', 'branch_value_log')) {
                $table->json('branch_value_log')->nullable()->after('asset_current_unit');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * SQL Query:
     * ALTER TABLE `access_level` DROP COLUMN `amend_asset`;
     * ALTER TABLE `assets_branch_values` DROP COLUMN `branch_value_log`;
     */
    public function down(): void
    {
        Schema::table('access_level', function (Blueprint $table) {
            $table->dropColumn('amend_asset');
        });

        Schema::table('assets_branch_values', function (Blueprint $table) {
            $table->dropColumn('branch_value_log');
        });
    }
};
