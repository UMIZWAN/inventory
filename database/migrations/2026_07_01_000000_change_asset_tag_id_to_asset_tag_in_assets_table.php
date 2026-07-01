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
| ALTER TABLE `assets` DROP FOREIGN KEY `assets_asset_tag_id_foreign`;
| ALTER TABLE `assets` DROP COLUMN `asset_tag_id`;
| ALTER TABLE `assets`
|   ADD COLUMN `asset_tag` VARCHAR(191) COLLATE utf8mb4_unicode_ci NULL
|   AFTER `asset_category_id`;
|
| -- DOWN
| ALTER TABLE `assets` DROP COLUMN `asset_tag`;
| ALTER TABLE `assets`
|   ADD COLUMN `asset_tag_id` BIGINT UNSIGNED NULL
|   AFTER `asset_category_id`;
| ALTER TABLE `assets`
|   ADD CONSTRAINT `assets_asset_tag_id_foreign`
|   FOREIGN KEY (`asset_tag_id`) REFERENCES `assets_tag` (`id`) ON DELETE CASCADE;
|
*/

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropForeign(['asset_tag_id']);
            $table->dropColumn('asset_tag_id');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->string('asset_tag')->nullable()->after('asset_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('asset_tag');
        });

        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('asset_tag_id')
                ->nullable()
                ->after('asset_category_id')
                ->constrained('assets_tag')
                ->cascadeOnDelete();
        });
    }
};
