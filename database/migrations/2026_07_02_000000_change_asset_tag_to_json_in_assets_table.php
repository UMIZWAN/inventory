<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|--------------------------------------------------------------------------
| Equivalent raw SQL (for running on live server directly)
|--------------------------------------------------------------------------
|
| -- UP
| UPDATE `assets` SET `asset_tag` = NULL WHERE `asset_tag` = '';
| UPDATE `assets` SET `asset_tag` = JSON_ARRAY(`asset_tag`) WHERE `asset_tag` IS NOT NULL;
| ALTER TABLE `assets` MODIFY COLUMN `asset_tag` JSON NULL;
|
| -- DOWN
| ALTER TABLE `assets` MODIFY COLUMN `asset_tag` VARCHAR(191) NULL;
| UPDATE `assets` SET `asset_tag` = JSON_UNQUOTE(JSON_EXTRACT(`asset_tag`, '$[0]'))
|   WHERE `asset_tag` LIKE '[%';
|
*/

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE `assets` SET `asset_tag` = NULL WHERE `asset_tag` = ''");
        DB::statement("UPDATE `assets` SET `asset_tag` = JSON_ARRAY(`asset_tag`) WHERE `asset_tag` IS NOT NULL");
        DB::statement("ALTER TABLE `assets` MODIFY COLUMN `asset_tag` JSON NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `assets` MODIFY COLUMN `asset_tag` VARCHAR(191) NULL");
        DB::statement("UPDATE `assets` SET `asset_tag` = JSON_UNQUOTE(JSON_EXTRACT(`asset_tag`, '$[0]')) WHERE `asset_tag` LIKE '[%'");
    }
};
