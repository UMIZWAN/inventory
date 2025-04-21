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
        Schema::create('assets_tag', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('assets_category', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('assets_branch', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });


        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_running_number')->unique();
            $table->text('asset_description')->nullable();
            $table->string('asset_type');
            $table->foreignId('asset_category_id')->constrained('assets_category')->cascadeOnDelete();
            $table->foreignId('asset_tag_id')->constrained('assets_tag')->cascadeOnDelete();
            $table->unsignedInteger('asset_stable_value');
            $table->unsignedInteger('asset_current_value');
            $table->decimal('asset_purchase_cost', 12, 4);
            $table->decimal('asset_sales_cost', 12, 4);
            $table->string('asset_unit_measure');
            $table->foreignId('assets_branch_id')->constrained('assets_branch')->cascadeOnDelete();
            $table->foreignId('assets_location_id')->constrained('assets_branch')->cascadeOnDelete();
            $table->string('asset_image')->nullable();
            $table->json('assets_remark')->nullable();
            $table->json('assets_log')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
        Schema::dropIfExists('assets_tag');
        Schema::dropIfExists('assets_category');
        Schema::dropIfExists('assets_branch');
    }
};
