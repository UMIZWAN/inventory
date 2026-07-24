<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Equivalent raw SQL (for running on live server directly)
|--------------------------------------------------------------------------
|
| -- UP
| ALTER TABLE `assets` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `asset_tag`;
|
| -- DOWN
| ALTER TABLE `assets` DROP COLUMN `is_active`;
|
*/

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('asset_tag');
            }
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('is_active');
        });
    }
};
