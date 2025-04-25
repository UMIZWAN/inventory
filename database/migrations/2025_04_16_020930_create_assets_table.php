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
            $table->string('asset_type')->nullable();
            $table->foreignId('asset_category_id')->constrained('assets_category')->cascadeOnDelete();
            $table->foreignId('asset_tag_id')->constrained('assets_tag')->cascadeOnDelete();
            $table->unsignedInteger('asset_stable_unit')->default(0);
            $table->decimal('asset_purchase_cost', 12, 4)->nullable();
            $table->decimal('asset_sales_cost', 12, 4)->nullable();
            $table->string('asset_unit_measure');
            $table->string('asset_image')->nullable();
            $table->text('assets_remark')->nullable();
            $table->json('assets_log')->nullable();
            $table->timestamps();
        });

        Schema::create('assets_branch_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('asset_branch_id')->constrained('assets_branch')->cascadeOnDelete();
            $table->foreignId('asset_location_id')->nullable()->constrained('assets_branch')->cascadeOnDelete();
            $table->unsignedInteger('asset_current_unit')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_branch_values');
        Schema::dropIfExists('assets');
        Schema::dropIfExists('assets_tag');
        Schema::dropIfExists('assets_category');
        Schema::dropIfExists('assets_branch');
    }
};
